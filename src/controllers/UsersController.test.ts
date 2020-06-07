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
