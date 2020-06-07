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
