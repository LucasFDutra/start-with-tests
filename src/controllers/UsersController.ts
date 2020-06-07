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
