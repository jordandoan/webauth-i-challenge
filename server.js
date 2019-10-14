const express = require("express");
const bcrypt = require("bcryptjs");
const db = require('./users-model');

const server = express();
server.use(express.json());

server.post("/api/users", (req,res) => {
  if (req.body) {
    const hash = bcrypt.hashSync(req.body.password, 14);
    req.body.password = hash;
    db.register(req.body)
      .then(id => res.status(201).json(id))
      .catch(err => res.status(500).json(id));
  } else {
    res.status(400).json({error: "Username and password are required"})
  }
})

server.post("/api/login", (req,res) => {
  if (req.body) {
    db.login(req.body)
      .then(user => {
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
          res.status(401).json({ error: 'Incorrect credentials' });
        } else {
          res.status(200).json({message: "Successfully logged in!"});
        }
      })
      .catch(err => res.status(500).json(id));
  } else {
    res.status(400).json({error: "Username and password are required"})
  }
});

server.get("/api/users", restricted, (req,res) => {
  db.getUsers()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json(err));
});

server.get("/api/restricted/:any", restricted, (req,res) => {
  res.status(200).json({message: "You are logged in and can view this!"});
})

function restricted(req, res, next) {
  const { username, password } = req.headers;
  if (username && password) {
    db.login({ username })
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: 'YOU SHALL NOT PASS' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: 'Unexpected error' });
      });
  } else {
    res.status(400).json({ message: 'YOU SHALL NOT PASS' });
  }
}

module.exports = server;
