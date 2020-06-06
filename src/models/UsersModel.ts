import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connection from '../database/connection';

class UserModel {
  public insertUser = async () => {
    const password = '1234';
    const id = crypto.randomBytes(8).toString('hex');
    const name = 'Lucas Dutra';
    const email = 'lucasfelipedutra@gmail.com';
    const password_hash = await bcrypt.hash(password, 10);
    const value = await connection('users').insert({
      id,
      name,
      email,
      password_hash,
    });
    return value;
  }
}

export default new UserModel();
