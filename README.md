# Objetivo
Vou desenvolver uma aplicação typescript super simples, para inserir um usuário no banco de dados.

# O que instalar
- [node](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/)

# Configurando o jest
Para fazer testes vamos utilizar o [jest](https://jestjs.io/pt-BR/).

- Para instalar e configurar o jest para typescript
```shell
$ yarn add jest -D
$ yarn add --dev babel-jest @babel/core @babel/preset-env
$ yarn add --dev @babel/preset-typescript
$ yarn add --dev @types/jest
$ yarn jest --init
```

- crie o arquivo `babel.config.js`
```JavaScript
// babel.config.js
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/preset-typescript',
    ],
  };
```

Ao rodar o comando de init, aparecerá um arquivo chamado `jest.config.js`. Esse arquivo contem as configurações do jest, deixe-o da seguinte forma:

```JavaScript
module.exports = {
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**"],
  coverageDirectory: "__tests__",
  testEnvironment: "node",
  testMatch: [
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
};
```

Para ter os testes rodando, utilize o comando

```shell
$ yarn jest
```

# Configurando o banco de dados
Para trabalhar com banco de dados vamos utilizar o knex como query builder e como banco de dados utilizarei o sqlite para teste e desenvolvimento e o postgres como banco de produção. Apesar que no final das contas utilizarei apenas o sqlite de testes.

Antes de instalar o knex, vamos instalar os bancos de dados

## Sqlite
O sqlite tem a vantagem de não precisar de instalação, para utilizá-lo basta criar um arquivo `.sqlite` no local em que quiser deixar seu banco de dados.

## Postgres
A forma mais simples de instalar o postgres é via docker. Para isso siga os passos a seguir:

- Instalar o docker
  ```shell
  sudo apt install docker.io
  sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  sudo groupadd docker
  sudo usermod -aG docker $USER
  su $USER
  ```

- Instalar o postgres
Para criar o postegres dentro de um container docker, basta colocar o arquivo `docker-compose.yml` em algum diretório no seu computador, e rodar o comando `docker-compose up -d`. isso fará com que a sua máquina docker fique rodando sem que seja necessário ficar com o terminal aberto. E também é possível controlar os container com a ajuda da extensão para docker que tem no vscode

- Arquivo docker-compose.yml
```yml
version: "3"

services:
    db:
        image: postgres
        environment:
            POSTGRES_PASSWORD: superSenha
            POSTGRES_USER: postgres
            POSTGRES_DB: my_db
        ports:
            - "5432:5432"
        volumes:
            - ./pgdata:/var/lib/postgresql/data
```

> OBS.: Lembre de configurar a senha para sua máquina postgres.

## Instalar o knex
Para instalar o knex e os plugins para os devidos bancos de dados, utilize o comando:
```shell
$ yarn add knex
$ yarn add sqlite3
$ yarn add pg
$ yarn knex init -x ts
```

Agora que rodou o comando de init para o knex, você pode configurar o arquivo `knexfile.ts` que aparece na pasta principal do projeto. É nesse arquivo que vamos definir os bancos de dados que o knex verá. Mas também é legal criar um arquivo com variáveis de ambiente, que conterá o nome do banco de dados, senhas e afins. Para isso vou criar o arquivo `.env`.

```JavaScript
DB_CLIENT=pg
DB_HOST=127.0.0.1
DB_USER=docker
DB_PASS=1234
DB_NAME=nodeauth
```

> OBS.: Como esse arquivo contém informações como senhas, então lembresse de colocá-lo no `.gitignore`. Eu não vou colocá-lo pois quero deixar de exemplo.

Como vamos pegar informações de variáveis de ambiente, precisaremos da lib `dotenv`, para instalá-la basta dar o comando

```shell
$ yarn add dotenv
```

Agora sim, podemos configurar o arquivo `knexfile.ts`

- knexfile
  ```JavaScript
  import dotenv from 'dotenv';

  dotenv.config({
    path: '.env',
  });

  module.exports = {
    development: {
      client: 'sqlite3',
      connection: {
        filename: './src/database/database.sqlite',
      },
      migrations: {
        directory: './src/database/migrations',
      },
    },

    test: {
      client: 'sqlite3',
      connection: {
        filename: './__tests__/database/database.sqlite',
      },
      migrations: {
        directory: './src/database/migrations',
      },
    },

    production: {
      client: process.env.DB_CLIENT,
      connection: {
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
      },
      migrations: {
        tableName: 'knex_migrations',
      },
    },
  };
  ```

## Criando arquivos necessários
crie externamente uma pasta `__test__` e dentro dela uma pasta chamada `database`. E dentro dessa pasta coloque o arquivo `database.sqlite`. Esse será nosso banco de dados de teste

```shell
__tests__
└── database
    └── database.sqlite
```

crie a pasta `src`, dentro dela crie a pasta `database` e ali dentro crie outro arquivo `database.sqlite`, esse será o banco de desenvolvimento. Dentro dessa mesma pasta crie o arquivo `connection.ts` que terá o seguinte código

```TypeScript
import knex from 'knex';
import config from '../../knexfile';

const connection = knex(
  process.env.NODE_ENV === 'development'
    ? config.development
    : process.env.NODE_ENV === 'test'
      ? config.test
      : config.production,
);

export default connection;
```

Esse código estabelece que se a variável de ambiente `NODE_ENV` for igual a development, o banco de dados utilizado será o de desenvolvimento, caso seja igual a test então será o banco de teste, e se não tiver valor será o de produção.

Agora vamos inicializar uma migration, com o comando
```shell
$ knex migrate:make migration_name -x ts
```

Essa migration foi criada em `src/database/migrations`. Entre no arquivo e coloque o seguinte código

```TypeScript
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('users', (table) => {
    table.string('id').primary().unique().notNullable();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('users');
};
```

Agora vá dentro do arquivo `package.json` e vamos criar os scripts.
```json
"scripts": {
  "prod": "NODE_ENV=production tsc",
  "dev": "NODE_ENV=development ts-node-dev --respawn --transpileOnly src/server.ts --ignore-watch *.test.ts",
  "pretest": "NODE_ENV=test knex migrate:latest",
  "test": "NODE_ENV=test jest",
  "posttest": "NODE_ENV=test knex migrate:rollback --all"
},
```

Isso fará com que se digitarmos `yarn prod` ele inicializa a variavel de ambiente de produção e roda o tsc. Se rodarmos `yarn dev` ele inicializa o ambiente de desenvolvimento, se rodarmos `yarn test` ele primeiro roda o `pretest` inicializando as migrations do banco de dados, e depois roda os testes, e depois da `rollback` nas migrations limpando o banco de dados.

# A aplicação node
Como o foco não é a aplicação, então vou somente colocar os arquivos aqui.

## App
```TypeScript
import express from 'express';
import cors from 'cors';
import routes from './routes';

class App {
  public express: express.Application;

  public constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
  }

  private middlewares() : void {
    this.express.use(express.json());
    this.express.use(cors());
  }

  private routes() : void {
    this.express.use('/', routes);
  }
}

export default new App().express;
```

## Server
```TypeScript
import App from './app';

const PORT = 3333;

const app = App;

app.listen(PORT);
```

## Routes
```TypeScript
import { Router } from 'express';
import UsersController from './controllers/UsersController';

const routes = Router();

routes.post('/users', UsersController.create);

export default routes;
```

## Controller
```TypeScript
import { Request, Response } from 'express';
import validate from 'validate.js';
import UsersModel from '../models/UsersModel';

const isValidateEmail = (email: string) => {
  const constraints = {
    from: {
      email: true,
    },
  };
  const isValidate = validate({ from: email }, constraints);

  return isValidate === undefined;
};

class UsersController {
  public create = async (req: Request, res: Response) => {
    const { name } = req.body;
    const { email } = req.body;
    const { password } = req.body;

    if (!isValidateEmail(email)) {
      return res.status(400).send({ error: 'Invalid email' });
    }
    try {
      const status = await UsersModel.insertUser({
        name,
        email,
        password,
      });
      if (!status) {
        return res.status(400).send({ error: 'Registration Failed' });
      }
      return res.status(200).send({ ok: 'Cadastro confirmado' });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }
}

export default new UsersController();
```

## Models
```TypeScript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connection from '../database/connection';

interface IBody {
  name: string,
  email: string,
  password: string,
}

class UserModel {
  public insertUser = async (body: IBody) : Promise<boolean> => {
    const { name } = body;
    const { email } = body;
    const { password } = body;

    try {
      const id = crypto.randomBytes(8).toString('hex');
      const password_hash = await bcrypt.hash(password, 10);

      const value = await connection('users').insert({
        id,
        name,
        email,
        password_hash,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  public dropTable = async () => {
    await connection('users').del();
  }
}

export default new UserModel();
```

As libs necessárias são:
```shell
$ yarn add validate.js
$ yarn add bcryptjs
$ yarn add --dev @types/bcryptjs
$ yarn add cors
$ yarn add --dev @types/cors
$ yarn add crypto
$ yarn add express
$ yarn add --dev @types/express
```

A aplicação em sí bate na rota `/` com um método post, passando um body com nome, email e senha para o controller e o controller valida e passa isso para o model adicionar o usuário ao banco.

# Os testes
Vamos adicionar dois testes. Um dentro da pasta controller e outro dentro da pasta model, o nome deles é identico ao do arquivo que vai testar, mas com o .test no nome

Para rodar os testes utilize a lib supertest e a faker,  supertest permite utilizarmos os métodos http e a faker fornece inputs fake para os testes.

```shell
$ yarn add --dev faker
$ yarn add --dev @types/faker
$ yarn add --dev supertest
$ yarn add --dev @types/supertest
```

Uma coisa importante é criar dentro do model uma função que limpa a tablea (o que já existe), para que sempre antes de cada teste essa função limpe a base, assim evitando qualquer problema caso o rollback da migration não ocorra.

- Arquivo `UsersController.test.ts`
```TypeScript
import request from 'supertest';
import faker from 'faker';
import app from '../app';
import UsersModel from '../models/UsersModel';

const clearTable = () => {
  UsersModel.dropTable();
};

describe('Create user', () => {
  beforeEach(clearTable);
  // send manda um body, para mandar um header utilize o set
  it('create a valid user', async () => {
    const response = await request(app).post('/users').send({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(200);
  });

  it('create an invalid user', async () => {
    const response = await request(app).post('/users').send({
      name: faker.name.findName(),
      email: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(400);
  });

  it('create an invalid user without name', async () => {
    const response = await request(app).post('/users').send({
      email: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(400);
  });
});

```


- Arquivo `UsersModel.test.ts`
```TypeScript
import bcrypt from 'bcryptjs';
import faker from 'faker';
import UsersModel from './UsersModel';

const clearTable = () => {
  UsersModel.dropTable();
};

describe('User', () => {
  beforeEach(clearTable);

  it('should create an new user', async () => {
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    expect(await UsersModel.insertUser(body)).toBe(true);
  });

  it('error in create an new user missing email', async () => {
    const body = {
      name: faker.name.findName(),
      password: faker.internet.password(),
    };

    expect(await UsersModel.insertUser(body)).toBe(false);
  });

  it('error in create an new user missing name', async () => {
    const body = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    expect(await UsersModel.insertUser(body)).toBe(false);
  });

  it('should create an new user missing password', async () => {
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
    };

    expect(await UsersModel.insertUser(body)).toBe(false);
  });
});
```

Ao rodarmos o comando `yarn test` veremos o seguinte
<img src='./img/fig001.png' />

Esse quadro é o resultado do coverage que o jest faz. ele indica o quanto dos nossos arquivos foram testados. mas se abrirmos o arquivo `__tests__/coverage/lcov-report/index.html` no nosso navegador poderemos ter muito mais informações de coverage, até mesmo a informação de que linha não foi testada.

<img src='./img/fig002.gif' />


As libs necessárias são:
```shell
$ yarn add validate.js
$ yarn add bcryptjs
$ yarn add --dev @types/bcryptjs
$ yarn add cors
$ yarn add --dev @types/cors
$ yarn add crypto
$ yarn add express
$ yarn add --dev @types/express
```

A aplicação em sí bate na rota `/` com um método post, passando um body com nome, email e senha para o controller e o controller valida e passa isso para o model adicionar o usuário ao banco.

# Os testes
Vamos adicionar dois testes. Um dentro da pasta controller e outro dentro da pasta model, o nome deles é identico ao do arquivo que vai testar, mas com o .test no nome

Para rodar os testes utilize a lib supertest e a faker,  supertest permite utilizarmos os métodos http e a faker fornece inputs fake para os testes.

```shell
$ yarn add --dev faker
$ yarn add --dev @types/faker
$ yarn add --dev supertest
$ yarn add --dev @types/supertest
```

Uma coisa importante é criar dentro do model uma função que limpa a tablea (o que já existe), para que sempre antes de cada teste essa função limpe a base, assim evitando qualquer problema caso o rollback da migration não ocorra.

- Arquivo `UsersController.test.ts`
```TypeScript
import request from 'supertest';
import faker from 'faker';
import app from '../app';
import UsersModel from '../models/UsersModel';

const clearTable = () => {
  UsersModel.dropTable();
};

describe('Create user', () => {
  beforeEach(clearTable);
  // send manda um body, para mandar um header utilize o set
  it('create a valid user', async () => {
    const response = await request(app).post('/users').send({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(200);
  });

  it('create an invalid user', async () => {
    const response = await request(app).post('/users').send({
      name: faker.name.findName(),
      email: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(400);
  });

  it('create an invalid user without name', async () => {
    const response = await request(app).post('/users').send({
      email: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(400);
  });
});

```


- Arquivo `UsersModel.test.ts`
```TypeScript
import bcrypt from 'bcryptjs';
import faker from 'faker';
import UsersModel from './UsersModel';

const clearTable = () => {
  UsersModel.dropTable();
};

describe('User', () => {
  beforeEach(clearTable);

  it('should create an new user', async () => {
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    expect(await UsersModel.insertUser(body)).toBe(true);
  });

  it('error in create an new user missing email', async () => {
    const body = {
      name: faker.name.findName(),
      password: faker.internet.password(),
    };

    expect(await UsersModel.insertUser(body)).toBe(false);
  });

  it('error in create an new user missing name', async () => {
    const body = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    expect(await UsersModel.insertUser(body)).toBe(false);
  });

  it('should create an new user missing password', async () => {
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
    };

    expect(await UsersModel.insertUser(body)).toBe(false);
  });
});
```

Ao rodarmos o comando `yarn test` veremos o seguinte
<img src='./img/fig001.png' />

Esse quadro é o resultado do coverage que o jest faz. ele indica o quanto dos nossos arquivos foram testados. mas se abrirmos o arquivo `__tests__/coverage/lcov-report/index.html` no nosso navegador poderemos ter muito mais informações de coverage, até mesmo a informação de que linha não foi testada.

<img src='./img/fig002.gif' />
