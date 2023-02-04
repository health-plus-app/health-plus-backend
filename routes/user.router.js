const express = require('express');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: '8939W24thst',
  port: 5432,
})

const router = express.Router();

// Get user by id
router.get('/:id', async (req,res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM users where id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }

        res.status(200).json(results.rows)
    })
})

function generateUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

// Register a user
router.post('/register', async(req, res) => {
    console.log(req.body);
    const {username, password} = req.body
    let myuuid = generateUUID();

    pool.query('insert into users (id, email, password) values($1,$2,$3)', [myuuid, username, password], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: "User successfully created",

        })
    })
})
module.exports = router;