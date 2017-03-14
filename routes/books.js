'use strict';

const express = require('express');

const router = express.Router();
const knex = require('../knex.js');
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');

router.get('/books', (req, res) => {
    knex("books")
        .orderBy("title")
        .then((books) => {
            res.send(camelizeKeys(books));
        })
        .catch((err) => {
            res.sendStatus(500);
        });
});

router.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    knex("books")
        .where('id', id)
        .then((books) => {
            res.send(camelizeKeys(books[0]));
        })
        .catch((err) => {
            res.sendStatus(404);
        });
});

router.post('/books', (req, res, next) => {
    const book = {};
    Object.keys(req.body).forEach((key) => {
      book[key] = req.body[key];
    });
    knex("books")
        .insert(decamelizeKeys(book), '*')
        .then((books) => {
            res.send(camelizeKeys(books[0]));
        })
        .catch((err) => {
            next(err);
        });
});
router.patch('/books/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const updateBook = {};
    Object.keys(req.body).forEach((key) => {
        updateBook[key] = req.body[key];
    });
    knex("books")
        .where("id", id)
        .then((books) => {
            if (!books[0]) {
                res.sendStatus(404);
            }
            return knex("books")
                .update(decamelizeKeys(updateBook), "*")
                .where("id", id);
        })
        .then((books) => {
            res.send(camelizeKeys(books[0]));
        })
        .catch((err) => {
            next(err);
        });
});
router.delete('/books/:id', (req, res, next) => {
    const id = Number(req.params.id);
    let book;
    knex("books")
        .where("id", id)
        .then((row) => {
            if (!row[0]) {
                res.sendStatus(404);
            }

            book = row[0];

            return knex("books")
                .del()
                .where("id", id);
        })
        .then(() => {
            delete book.id;
            res.send(camelizeKeys(book));
        })
        .catch((err) => {
            res.sendStatus(500);
        });
});

module.exports = router;
