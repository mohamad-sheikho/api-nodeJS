const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../Config/database');

const authenticateToken = require('../Middleware/authenticationToken');
const authenticateAdmin = require('../Middleware/authenticationAdmin');
const generateAccessToken = require('../Middleware/generateAccessToken');

router.route('/users')
    .get(function (req, res) {
        var usersByGroup = {};
        con.query('SELECT users.firstname, users.lastname, groups.name FROM users INNER JOIN groups WHERE groups.id = users.groups', function (err, result) {
            result.map((user) => {
                if (!usersByGroup[user.name]) {
                    usersByGroup[user.name] = [];
                }
                usersByGroup[user.name].push(user);

            })
            if (res.statusCode == 200) {
                res.send(usersByGroup);
            } else {
                res.send('Error');
            }
        });
    });
router.route('/')
    .get(function (req, res) {
        con.query('SELECT name FROM groups', function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    })
    .post(authenticateAdmin, function (req, res) {
        con.query('INSERT INTO groups SET ?', req.body, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    });
router.route('/:id')
    .get(function (req, res) {
        con.query('SELECT users.firstname, users.lastname FROM users INNER JOIN groups ON users.groups = groups.id WHERE groups.id=' + req.params.id, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    })
    .put(authenticateAdmin, function (req, res) {
        con.query('UPDATE groups SET name="' + req.body["name"] + '" WHERE id=' + req.params.id, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    })
    .delete(authenticateAdmin, function (req, res) {
        con.query('DELETE FROM groups WHERE id=' + req.params.id, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    });
router.put('/:id/join', authenticateToken, function (req, res) {
    con.query('UPDATE users SET groups=' + req.params.id + ' WHERE id=' + req.body["id"], function (err, results) {
        if (err) throw err;
        res.status(200).json(results);
    });
});
router.put('/:id/users', authenticateAdmin, function (req, res) {
    con.query('UPDATE users SET ? WHERE groups=' + req.params.id, req.body, function (err, results) {
        if (err) throw err;
        res.status(200).json(results);
    });
});

module.exports = router;