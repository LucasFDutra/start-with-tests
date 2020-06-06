import { Request, Response } from 'express';
import UserModel from '../models/UsersModel';

export default {
  async create(req: Request, res: Response) : Promise<any> {
    const status = await UserModel.insertUser(req.body);
    if (status) {
      return res.status(200);
    }
    return res.status(500);
  },
};
