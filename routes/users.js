'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');
router.post('/users', (req, res, next) => {
    const user = {};
    Object.keys(req.body).forEach((key) => {
        user[key] = req.body[key];
    });
    if (Object.keys(user).some(field => field === "") || !user.email || !user.password) {
        res.status(400).send("must not be Blank");
    }
    if (user.password.length < 8) {
        res.status(400).send("must be at least 8 characters long");
    }
    knex("users")
        .where("email", user.email)
        .then((users) => {
            if (users[0]) {
                res.status(400).send("already exists");
            }
            bcrypt.hash(user.password, 12)
                .then((hashed_password) => {
                    delete user.password;
                    user.hashed_password = hashed_password;
                    return knex("users")
                        .insert(decamelizeKeys(user), '*')
                }).then((users) => {
                  delete users[0].hashed_password;
                  res.send(camelizeKeys(users[0]));
                })
                .catch((err) => {
                  if (err) {
                     next(err);
                  }
                });
        })
});
module.exports = router;
