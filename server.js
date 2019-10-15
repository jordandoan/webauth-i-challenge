const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const db = require('./users-model');

const server = express();

server.use(
  session({
    name: 'chickenwang', // default is connect.sid
    secret: 'secret secret secret secret password',
    cookie: {
      maxAge: 1 * 3 * 60 * 60 * 1000,
      secure: false, // only set cookies over https. Server will not send back a cookie over http.
    },
    httpOnly: true, // don't let JS code access cookies. Browser extensions run JS code on your browser!
    resave: false,
    saveUninitialized: false,
  })
);
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
          req.session.user = user;
          res.status(201).json({message: "Successfully logged in!"});
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
  console.log(req.session.user);
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'YOU SHALL NOT PASS' });
  }
}

module.exports = server;
