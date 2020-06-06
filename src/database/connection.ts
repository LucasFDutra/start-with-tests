import knex from 'knex';
import config from '../../knexfile';

const connection = knex(process.env.NODE_ENV === 'test' ? config.development : config.production);

export default connection;
