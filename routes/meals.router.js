const express = require('express');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: 'password',
  port: 5432,
})

const router = express.Router();

// Get meal by id
router.get('/:id', async (req,res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM meals where id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }

        res.status(200).json(results.rows)
    })
})


// Post new meal (This should only work for user meals)
router.post('/', async(req, res) => {
    const meal = req.body
    pool.query('INSERT INTO meals (id, meal_name, calories, meal_type) values ($1, $2, $3, $4)', [meal.id, meal.meal_name, meal.calories, meal.meal_type], (error, results) => {
        if (error) {
            throw error
        }

        res.status(200).json(results.rows)
    })
})



module.exports = router;