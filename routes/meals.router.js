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
    const results = await pool.query('SELECT * FROM meals where id = $1', [id]);

    res.status(200).json(results.rows[0]);
})

router.post('/', async(req, res) => {
    var subqueries = new Array()
    subqueries.push(`LOWER(m.meal_name) like '%${req.body.meal_name}%'`) 
    var offset = req.body.offset * 10
    var clause = "";
    clause = subqueries.join(" and ")
    var query = `Select * from meals as m where ${clause} order by m.meal_name ASC limit 10 offset ${offset}`
    var queryCount = `Select count(*) from meals as m where ${clause}`
    console.log(query)
    const results = await pool.query(query)
    const count = await pool.query(queryCount)

    res.status(200).json({meals: results.rows, count: count.rows[0].count});
})


// Post new meal (This should only work for user meals)
// router.post('/', async(req, res) => {
//     const meal = req.body;
//     const results = await pool.query('INSERT INTO meals (id, meal_name, calories, meal_type) values ($1, $2, $3, $4)', [meal.id, meal.meal_name, meal.calories, meal.meal_type]);

//     res.status(200).json(results.rows);
// })



module.exports = router;
