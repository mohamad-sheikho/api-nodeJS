const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../Config/database');
const bcrypt = require('bcrypt');

const authenticateToken = require('../Middleware/authenticationToken');
const authenticateAdmin = require('../Middleware/authenticationAdmin');
const generateAccessToken = require('../Middleware/generateAccessToken');

router.route('/')
    .get(function (req, res) {
        con.query('SELECT firstname, lastname FROM users', function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    })
    .post(function (req, res) {
        if (req.body["firstname"] && req.body["lastname"] && req.body["email"] && req.body["password"]) {
            req.body["password"] = bcrypt.hashSync(req.body["password"], 10);
            req.body["admin"] = 0;
            req.body["created_at"] = new Date();

            con.query('INSERT INTO users SET ?', req.body, function (err, results) {
                if (err) throw err;
                if (results.affectedRows == 1) {
                    res.status(200).json(results);
                } else {
                    res.status(400).json(results);
                }
            });
        } else {
            res.status(400).json({ message: "Missing parameters" });
        }
    });
router.post('/login', function (req, res) {
    if (req.body["email"] && req.body["password"]) {
        con.query('SELECT * FROM users WHERE email="' + req.body['email'] + '"', function (err, results) {
            if (err) throw err;
            if (results.length == 1) {
                bcrypt.compare(req.body["password"], results[0]["password"], function (error, match) {
                    if (match) {
                        const accessToken = generateAccessToken(results[0]);
                        res.status(200).send(accessToken);
                    } else {
                        res.status(401).send({ error: "Invalid credentials"});
                    }
                });
            } else {
                res.status(401).json({
                    message: "Invalid credentials",
                });
            }
        });
    } else {
        res.status(400).json({ message: "Missing parameters" });
    }
});
router.route('/me')
    .get(authenticateToken, function (req, res) {
        res.status(200).json(req.user);
    })
    .put(authenticateToken, function (req, res) {
        req.body["updated_at"] = new Date();
        con.query('UPDATE users SET ? WHERE id=' + req.user.user['id'], req.body, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    });

router.route('/:id')
    .get(authenticateToken, function (req, res) {
        con.query('SELECT * FROM users WHERE id=' + req.params.id, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    })
    .put(authenticateAdmin, function (req, res) {
        req.body["updated_at"] = new Date();
        con.query('UPDATE users SET ? WHERE id=' + req.params.id, req.body, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    })
    .delete(authenticateAdmin, function (req, res) {
        con.query('DELETE FROM users WHERE id=' + req.params.id, function (err, results) {
            if (err) throw err;
            res.status(200).json(results);
        });
    });

module.exports = router;