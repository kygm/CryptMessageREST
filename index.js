//package declarations
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');
const cookieParser = require('cookie-parser');
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
const dbUrl = "mongodb+srv://admin:Password1@cluster.qtabs.mongodb.net/test?retryWrites=true&w=majority";


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

//load clients model
//require('./Models/Clients');
//const xyz = mongoose.model('xyz');

//load transact model
//require('./Models/Transaction');
//const abc = mongoose.model('abc');


app.get('/', async (req, res) => {
  var list;
  list = await xyz.find({}).lean();

  return res.status(200).json({ 'lll': list });

});


//********************CONFIG*SECTION***********************//

//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
