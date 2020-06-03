import { Router } from 'express';

const routes = Router();

routes.get('/', (req, res) => {
  res.send('Hello my world');
});

export default routes;
