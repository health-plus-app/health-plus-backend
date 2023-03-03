const express = require('express');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

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
            res.status(200).json({
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
    const { email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    const user_id = uuid.v4();

    await pool.query('INSERT INTO USERS (id, email, password) VALUES($1,$2,$3)', [user_id, email, hashedPassword]);
    res.status(200).json({
        message: "User successfully created",
        id: user_id
    })
})

// Get User Profile
router.get('/info/:id', async (req,res) => {
    const { id } = req.params;

    const results = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [id]);
    if (results.rowCount === 0){
        res.status(404).json({
            message: "User profile not found",
            error: "No user exists with specified user id"
        })
    }
    res.status(200).json(results.rows);
})

// helper function to test if user exists
const user_exists = async id => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rowCount === 0) {
        return false;
    } else {
        return true;
    }
}

// Put User Profile
router.put('/info/:id', async (req,res) => {
    const { id } = req.params;
    const { goal, weight, allergies } = req.body;

    if (!(await user_exists(id))) {
        res.status(404).json({
            message: "Could not find user profile",
            error: "No user exists with specified user id"
        });
        return;
    }

    const results = (await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [id]));
    if (results.rowCount === 0) {
        await pool.query('INSERT INTO user_profiles (user_id, fitness_goal, weight, allergies) VALUES($1,$2,$3,$4)', [id, goal, weight, allergies]);
        res.status(200).json({
            message: "User Profile successfully created",
        });
    } else {
        await pool.query('UPDATE user_profiles SET fitness_goal = $1, weight = $2, allergies = $3 WHERE user_id = $4', [goal, weight, allergies, id]);
        res.status(200).json({
            message: "User Profile successfully updated",
        });
    }
})

// Get user by id
router.get('/:id', async (req,res) => {
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
