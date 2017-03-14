'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const jwt = require('jsonwebtoken');
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');
router.get('/token', (req, res, next) => {
    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            // res.set('Content-Type', 'match/json');
            res.send(false);
        } else {
            res.send(true);
        }
    });
});

router.post('/token', (req, res, next) => {
    const {
        email,
        password
    } = req.body;
    let user;
    knex("users")
        .where('email', email)
        .then((users) => {
            user = users[0];
            return bcrypt.compare(password, user.hashed_password);
        })
        .then(() => {
            const token = jwt.sign({
                userId: user.id
            }, process.env.JWT_KEY, {
                expiresIn: '7days'
            });
            res.cookie('token', token, {
                httpOnly: true,
                expires: new Date(
                    Date.now() + 1000 * 60 * 60 * 24 * 7),
                secure: router.get('env') === 'production'
            });
            delete user.hashed_password;
            res.send(camelizeKeys(user));
        })
        .catch((err) => {
                res.set('Content-Type', 'match/plain');
                res.status(400).send("Bad email or password");
        });
});

router.delete('/token', (req, res) => {
    res.clearCookie('token');
    res.end();
});


module.exports = router;
