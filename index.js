//package declarations
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');
const cookieParser = require('cookie-parser');
//for cryptographic operations
var crypto = require('crypto');

//port declaration
const PORT = process.env.PORT || 1800;

//authorization var
var authorized;

//todays date
var todaysDate = new Date();
var dd = String(todaysDate.getDate()).padStart(2, '0');
var mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = todaysDate.getFullYear();


//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//cookie parser
app.use(cookieParser());


var show = 0;

//mongodb database setup
//cloud db url
const dbUrl = "mongodb+srv://admin:Password1@cluster.qtabs.mongodb.net/CryptMessage?retryWrites=true&w=majority";


mongoose.connect(dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
//for showing page if conn error
var show;

const db = mongoose.connection;

db.on('error', () => {
  console.error.bind(console, 'connection error: ');
}).then(show = 1);
db.once('open', () => {
  console.log('MongoDB Connected');
}).then(show = 2);

//load users model
require('./Models/User');
const User = mongoose.model('Users');

//load transact model
//require('./Models/Transaction');
//const abc = mongoose.model('abc');


app.get('/', async (req, res) => {
  var list;
  list = await User.find({}).lean();

  return res.status(200).json({});

});

app.post('/createUser', async (req, res) => {
  //create user operations go here

  //generate salt (16 char in this instance)
  var salt = genRandomString(16);

  var pwd = sha512(req.body.password, salt.toString());

  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: pwd,
    salt: salt
  }
  user = await new User(newUser)
  .save().then(u =>{
    return(res.status(200).json(u));
  })
  
});

//posting login credentials. If true, set authorized cookie 
//as true and create uid cooke. If not, return.
app.post('/login', (req, res) => {

  //hashed pwd
  var pwd;
  var salt;
  User.find({
    username: req.body.username,
  }).lean().then(pass =>{
    pwd = pass
  });
  User.find({
    username: req.body.username,
  }).lean().then(s =>{
    salt = s
  });
  if(sha512(req.body.password, salt) == pwd)
  {
    return("Valid");
    //set auth cooker and uid cookies here
  }
  else
  {

    //if -1 in prog, throw error
    return "Invaild";
  }
});

app.post('/messages', async (req, res) => {

});

//if route not exists, send user here
app.get('*', (req, res) => {
  res.status(404).send(
    "404 Page Not Found! <a href='/'>Click to return to main</a>"
  );
});
//********************CONFIG*SECTION***********************//


//hashing algorithm

var sha512 = function (password, salt) {
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return value;
};

//salt gen
var genRandomString = function (length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length);   /** return required number of characters */
};

//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


