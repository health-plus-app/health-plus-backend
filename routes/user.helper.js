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
const getAge = async dateString => {
    let today = new Date();
    let year = Number(dateString.substr(0, 4))
    let month = Number(dateString.substr(5, 7))
    let day = Number(dateString. substr(8,10))
//    var birthDate = new Date();
    let age = today.getFullYear() - year;
    let m = today.getMonth() - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
    }
    return age;
}

module.exports = {user_exists, user_email_exists};
