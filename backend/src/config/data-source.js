require('dotenv').config();
const { DataSource } = require('typeorm');
const entities = require('../entities');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // vd: postgresql://user:password@localhost:5432/portfolio
  synchronize: false, // KHÔNG bật true ở production — luôn dùng migration
  logging: process.env.NODE_ENV === 'development',
  entities,
  migrations: ['src/migrations/*.js'],
  subscribers: []
});

module.exports = { AppDataSource };
