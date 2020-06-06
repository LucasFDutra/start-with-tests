import { Request, Response } from 'express';
import UserModel from '../models/UsersModel';

export default {
  async create(req: Request, res: Response) {
    const user = await UserModel.insertUser();
    return res.status(200).json(user);
  },
};
