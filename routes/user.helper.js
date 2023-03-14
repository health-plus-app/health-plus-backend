const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: 'password',
  port: 5432,
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

// helper function to test if user email is used
const user_email_exists = async email => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rowCount === 0) {
        return false;
    } else {
        return true;
    }
}

// 2003-06-23
const getAge = dateString => {
    let today = new Date();
    const date = dateString.split('-');
    year = parseInt(date[0]);
    month = parseInt(date[1]);
    day = parseInt(date[2]);
    let age = today.getFullYear() - year;
    let m = today.getMonth() - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
    }
    return age;
}

module.exports = {user_exists, user_email_exists, getAge};
