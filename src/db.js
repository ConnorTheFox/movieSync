const db = require('nedb')
const Promise = require('bluebird')

let videoDB = Promise.promisifyAll(new db())
let userDB = Promise.promisifyAll(new db())

module.exports = {videoDB:videoDB, userDB:userDB}