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

// Get ingredient by id
router.get('/:id', async (req,res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM ingredients where id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }

        res.status(200).json(results.rows)
    })
})

// Post ingredient
router.post('/', async(req, res) => {
    const {id, ingredient} = req.body
    pool.query('INSERT INTO ingredients (id, ingredient) values ($1, $2)', [id, ingredient], (error, results) => {
        if (error) {
            throw error
        }

        res.status(200).json(results.rows)
    })
})

module.exports = router;