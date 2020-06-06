import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});
console.log(process.env.NODE_ENV);
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
