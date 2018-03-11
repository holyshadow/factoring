const express = require('express')
const bodyParser = require('body-parser')


const app = express()
var routes = require('./route/factoringRoute'); //importing route

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
routes(app); //register the route



app.listen(3030, () => {
  console.log('Start server at port 3030.')
})