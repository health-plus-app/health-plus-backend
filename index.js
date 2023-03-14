var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.json())
app.use(cors()) // Use this after the variable declaration


const userRouter = require('./routes/user.router')
const mealsRouter = require('./routes/meals.router')
const MySQLStore = require('express-mysql-session')

app.get('/', function (req, res) {
  res.send('Hello from Health+')
})

app.use('/users', userRouter);
app.use('/meals', mealsRouter);


app.listen(3000)
