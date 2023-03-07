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
const { auth } = require('./auth.js');

// Get meal by id
router.get('/:id', auth, async (req,res) => {
    const { id } = req.params;
    const results = await pool.query('SELECT * FROM meals where id = $1', [id]);

    res.status(200).json(results.rows[0]);
})

// Get meal by name
router.post('/', auth, async(req, res) => {
    var subqueries = new Array();
    subqueries.push(`LOWER(m.meal_name) LIKE '%${req.body.meal_name}%'`);
    var offset = req.body.offset * 10;
    var clause = "";
    clause = subqueries.join(" and ");
    var query = `SELECT * FROM meals AS m WHERE ${clause} ORDER BY m.meal_name ASC LIMIT 10 OFFSET ${offset}`;
    var queryCount = `SELECT count(*) FROM meals AS m WHERE ${clause}`;
    const results = await pool.query(query);
    const count = await pool.query(queryCount);

    res.status(200).json({meals: results.rows, count: count.rows[0].count});
})

// Get meal by calories
router.post('/recommended', async(req, res) => {
  

})



module.exports = router;
