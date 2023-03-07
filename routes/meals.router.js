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
const { getAge } = require('./user.helper.js');

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
router.post('/recommended', auth, async(req, res) => {
  const { id }  = req.user;
  const results = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [id]);
  const { fitness_goal, meals_per_day } = results.rows[0];
  const { weight, gender, height, dob, total_cal} = req.body;
  const age = getAge(dob);
  
  console.log({ weight, gender, height, dob, total_cal});
  console.log(fitness_goal);
  console.log(meals_per_day);

  // stole this from https://stackoverflow.com/a/57363600
  const cosineSim = (A,B) =>{
    var dotproduct=0;
    var mA=0;
    var mB=0;
    for(i = 0; i < A.length; i++){ // here you missed the i++
        dotproduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct)/((mA)*(mB)) // here you needed extra brackets
    return similarity;
  }

  let bmr;
  if (gender === "male") {
      bmr = 66.5 + (13.75 * (weight / 2.2)) + (5 * (height * 2.54)) - (6.75 * age) 
  }
  else if (gender === "female") {
      bmr = 655.1 + (9.563 * (weight /2.2)) + (1.85 * (height * 2.54)) - (4.676 * age)
  }

  // TODO: Determine appropriate activity factor

  let calories = bmr - total_cal;
  let protein, carbs, fats;

  if (fitness_goal.toLowerCase() === "lose weight") {
    calories -= 500;
    protein = calories * 0.30;
    fats = calories * 0.30;
    carbs = calories * 0.40;
  }
  else if (fitness_goal.toLowerCase() === "gain weight") {
    calories += 500;
    protein = calories * 0.25;
    fats = calories * 0.25;
    carbs = calories * 0.50;
  } else if (fitness_goal.toLowerCase() === "maintain weight") {
    protein = calories * 0.20;
    fats = calories * 0.25;
    carbs = calories * 0.55; 
  } else {
    throw err("fitness goal is not valid");
  }

  ideal_meal_calories = Math.round(calories/meals_per_day);
  ideal_meal_protein = Math.round((protein/meals_per_day)/4); // 4 calories = 1 gram of protein
  ideal_meal_carbs = Math.round((carbs/meals_per_day)/4); // 4 calories = 1 gram of carbs
  ideal_meal_fats = Math.round((fats/meals_per_day)/9); // 9 calories = 1 gram of fat

  const response = await pool.query('SELECT * FROM meals');
  const ideal_meal_vector = [ideal_meal_calories, ideal_meal_protein, ideal_meal_carbs, ideal_meal_fats];
  let cos_sims = [];

  response.rows.map(meal => {
    const meal_calories = meal.calories !== undefined ? meal.calories : 1;
    const meal_protein = meal.protein !== undefined ? meal.protein : 1;
    const meal_carbs = meal.carbohydrates !== undefined ? meal.carbohydrates : 1;
    const meal_fats = meal.total_fat !== undefined ? meal.total_fat : 1;
    const meal_vector = [meal_calories, meal_protein, meal_carbs, meal_fats];
    cos_sims.push([cosineSim(ideal_meal_vector, meal_vector), meal, Math.abs(meal_calories - ideal_meal_calories), meal_vector, ideal_meal_vector])
  })
  cos_sims.sort((a, b) => {
    if (a[0] < b[0]) {
      return -1;
    } else if (b[0] > a[0]) {
      return 1;
    } else {
      return 0;
    }
  }).reverse();

  top_100_cos_sims = cos_sims.splice(0,100);

  top_100_cos_sims.sort((a, b) => {
    if (a[2] < b[2]) {
      return -1;
    } else if (b[2] > a[2]) {
      return 1;
    } else {
      return 0;
    }
  });

  const res_json = top_100_cos_sims.slice(0, 10).map(item => {
    return ({
      "image": item[1].image_url,
      "name": item[1].meal_name,
      "protein": item[1].protein, 
      "carbs": item[1].carbohydrates, 
      "fats": item[1].total_fat, 
      "cals": item[1].calories, 
      "description": item[1].meal_description
    })
  });

  res.status(200).json(res_json);
})



module.exports = router;
