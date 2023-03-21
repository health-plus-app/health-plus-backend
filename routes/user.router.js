const express = require('express');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: 'password',
  port: 5432,
})

const router = express.Router();

const { user_exists, user_email_exists } = require('./user.helper.js');
const { auth } = require('./auth.js');

// Login
router.post('/login', async (req,res) => {
    const { email, password } = req.body;
    const results = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (results.rowCount === 0) {
        res.status(401).json({
            message: "Login not successful",
            error: "User not found",
        })
    } else {
        const password_matches = await bcrypt.compare(password, results.rows[0].password);

        if (password_matches) {
            const payload = {
                user: {
                    id: results.rows[0].id
                }
            }
            const token = await jwt.sign(payload, 'secret', {
                expiresIn: 1000
            });
            res.status(200).json({
                token: token,
                message: "Login successful",
            })    
        } else {
            res.status(401).json({
                message: "Password is invalid",
            })
        }
    }
})

// Register a user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (await user_email_exists(email)) {
        res.status(409).json({
            message: "User could not be created",
            error: "A user with the specified email already exists"
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user_id = uuid.v4();

    await pool.query('INSERT INTO USERS (id, email, password) VALUES($1,$2,$3)', [user_id, email, hashedPassword]);
    res.status(200).json({
        message: "User successfully created",
        id: user_id
    })
})

// Get User Profile
router.get('/info', auth, async (req,res) => {
    const { id }  = req.user;

    const results = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [id]);
    if (results.rowCount === 0){
        return res.status(404).json({
            message: "User profile not found",
            error: "No user exists with specified user id"
        });
    }
    res.status(200).json(results.rows);
})

// Put User Profile
router.put('/info', auth, async (req,res) => {
    const { id }  = req.user;
    const { goal, weight, meals_per_day, allergies } = req.body;

    if (!(await user_exists(id))) {
        res.status(404).json({
            message: "Could not find user profile",
            error: "No user exists with specified user id"
        });
        return;
    }

    const results = (await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [id]));
    if (results.rowCount === 0) {
        return res.status(404).json({
            message: "User profile doesn't exists",
            error: "A user profile doesn't exist for the given id"
        });
    } else {
        await pool.query('UPDATE user_profiles SET fitness_goal = $1, weight = $2, allergies = $3, meals_per_day = $4 WHERE user_id = $5', [goal, weight, allergies, meals_per_day, id]);
        res.status(200).json({
            message: "User Profile successfully updated",
        });
    }
})

router.post('/info', auth, async (req,res) => {
    console.log("Creating user profile...");
    const { id }  = req.user;
    const { goal, weight, meals_per_day, allergies } = req.body;
    const results = (await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [id]));

    if (results.rowCount === 0) {
        await pool.query('INSERT INTO user_profiles (user_id, fitness_goal, weight, meals_per_day, allergies) VALUES($1,$2,$3,$4,$5)', [id, goal, weight, meals_per_day, allergies]);
        res.status(200).json({
            message: "User Profile successfully created",
        });
    } else {
        return res.status(404).json({
            message: "User profile already exists",
            error: "A user profile already exists with the given id"
        });
    }
});

// Get user by id
router.get('/:id', auth, async (req,res) => {
    const { id } = req.params;
    const results = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (results.rowCount === 0){
        res.status(401).json({
            message: "Could not find user",
            error: "No user exists with specified user id",
        })
    } else {
        res.status(200).json(results.rows)
    }
})

module.exports = router;
