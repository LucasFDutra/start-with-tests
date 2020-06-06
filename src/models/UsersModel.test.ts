import UsersModel from './UsersModel';

describe('Authetication', () => {
  it('valid insertion of an new user', async () => {
    const body = {
      name: 'Lucas',
      email: 'lucasfelipedutra@gmail.com',
      password: '1234',
    };

    const status = await UsersModel.insertUser(body);

    expect(status).toBe(true);
  });
});
