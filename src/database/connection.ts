import knex from 'knex';
import config from '../../knexfile';

const connection = knex(
  process.env.NODE_ENV === 'development'
    ? config.development
    : process.env.NODE_ENV === 'test'
      ? config.test
      : config.production,
);

export default connection;
