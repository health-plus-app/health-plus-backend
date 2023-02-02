var express = require('express')
var app = express()
const userRouter = require('./routes/user.router')

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

app.listen(3000)