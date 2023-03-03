var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.json())
app.use(cors()) // Use this after the variable declaration


const userRouter = require('./routes/user.router')
const mealsRouter = require('./routes/meals.router')
const MySQLStore = require('express-mysql-session')

// CRUD = CREATE READ UPDATE DELETE
// HTTP GET = READ
// HTTP DELETE = DELETE
// APPROXIMATE HTTP PUT = UPDATE
// APPROXIMATE HTTP POST = CREATE

// Example of a request
// HTTP/1.1 GET /
// USER-AGENT: chrome
// VERSION: 2.1

// Example of a response
// HTTP/1.1 200 OK
// Connection: Keep-Alive

// DATABASE = 

// Read
app.get('/', function (req, res) {
  res.send('Hello from Health+')
})

app.use('/users', userRouter);
app.use('/meals', mealsRouter);


app.listen(3000)