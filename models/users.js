const Connection = require('./../db_config')

const {
    DataTypes
} = require('sequelize')

const dbConnection = Connection.connect

const Users = dbConnection.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports.createUser = function (username, password) {

    Users.create({
        username,
        password
    }).then((data) => {
        console.log(data.toJSON())
    })

}

// dbConnection.drop().then(() => {
//     dbConnection.sync()
// })