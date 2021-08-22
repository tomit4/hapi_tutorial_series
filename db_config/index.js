const Sequelize = require('sequelize')

const dotenv = require("dotenv")

dotenv.config({
    path: '.env-local'
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.PORT,
    dialect: 'mariadb'
})

module.exports.connect = sequelize