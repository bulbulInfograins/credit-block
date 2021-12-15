// const jwt = require('jsonwebtoken');
const users = require("./routes/user");

const express = require('express');
const app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const cors = require('cors')
app.use(cors())

// var corsOptions = {
//   origin: 'http://127.0.0.1:5500/index.html',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }


const  mongoose = require('mongoose')

mongoose
  .connect('mongodb+srv://roshan:user12@cluster0.uoxgo.mongodb.net/credit-block?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Connected to the Database successfully');
  }).catch((err)=>{
    console.log(err);
  })


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.use('/',cors(corsOptions), users);
app.use('/',users);

app.listen(5000, ()=>{
    console.log("server is listning on port 5000");
});