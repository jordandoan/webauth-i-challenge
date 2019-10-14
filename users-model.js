const db = require("./data/dbconfig");

module.exports = { 
  register,
  login,
  getUsers
}

function register(user) {
  return db('users').insert(user)
    .then(ids => {return {id: ids[0]}})
}

function login(user) { 
  return db('users').where({username: user.username})
    .then(arr => arr[0])
}

function getUsers() {
  return db('users').select('users.username')
}