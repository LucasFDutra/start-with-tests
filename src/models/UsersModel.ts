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
