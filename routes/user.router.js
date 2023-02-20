const express = require('express');
const bcrypt = require('bcryptjs');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: 'password',
  port: 5432,
})

const router = express.Router();

// Login
router.get('/login', async(req,res) => {
    const {email, password} = req.body
    pool.query('select * from users where email=$1', [email], (error, results) => {
        if (error) {
            throw error
        }
        if (results.length == 0) {
            res.status(401).json({
                message: "Login not successful",
                error: "User not found",
            })
        }
        else {
            bcrypt.compare(password, results.rows[0].password).then(function(result) {
                result ?
                res.status(200).json({
                    message: "Login successful",
                    results
                })
                : res.status(401).json({
                    message: "Login not successful",
                })

            })
        }
    })
})

// Register a user
router.post('/register', async(req, res) => {
    console.log(req.body);
    const {id, email, password} = req.body

    const hash = bcrypt.hash(password, 10);

    pool.query('insert into users (id, email, password) values($1,$2,$3)', [id, email, hash], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: "User successfully created",

        })
    })
})

// Get User Profile
router.get('/info/:id', async(req,res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM user_profiles where id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        if (results.length == 0){
            res.status(401).json({
                message: "Could not find user profile",
                error: "User profile not found",
            })
        }
        res.status(200).json(results.rows)
    })
})

// Get User Health Statistics
router.get('/health/:id', async(req,res) => {
    const { id, data } = req.params;
    pool.query('SELECT * FROM user_health_statistics where id = $1 and date_recorded = $2', [id, data], (error, results) => {
        if (error) {
            throw error
        }
        if (results.length == 0){
            res.status(401).json({
                message: "Could not find user profile",
                error: "User profile not found",
            })
        }
        res.status(200).json(results.rows)
    })
})

// Get user by id
router.get('/:id', async (req,res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM users where id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        if (results.length == 0){
            res.status(401).json({
                message: "Could not find user",
                error: "User not found",
            })
        }
        res.status(200).json(results.rows)
    })
})



module.exports = router;
