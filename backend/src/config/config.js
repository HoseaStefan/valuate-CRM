require('dotenv').config();
const pe = process.env;

module.exports = {
  "development": {
    username: pe.DB_USERNAME,
    password: pe.DB_PASSWORD,
    database: pe.DB_DATABASE,
    host: pe.DB_HOST,
    port: pe.DB_PORT,
    "dialect": "postgres"
  }
}
