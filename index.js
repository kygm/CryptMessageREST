//package declarations
const express = require('express');
const app = express();
//body parser is depricated. use express.json and express.urlencoded
//const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');
const cookieParser = require('cookie-parser');
//for cryptographic operations
const bcrypt = require('bcryptjs');
const { json } = require('body-parser');
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

//load message model
require('./Models/Message');
const Message = mongoose.model('Messages');

//load friends model
require('./Models/Friends');
const Friend = mongoose.model('Friends');




app.get('/', async (req, res) => {
  var result;
  show ? result = "Application Running" : result = "Application Database Failiure";
  //var list;
  //list = await User.find({}).lean();

  return res.status(200).json({ result });

}); //end index route

app.post('/createUser', async (req, res) => {
  //create user operations go here

  var saltRounds = 10;
  //generate salt (16 char in this instance)
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, async function (err, hash) {

      const newUser = {
        username: req.body.username,
        email: req.body.email,
        password: hash
      }
      var usr = await User.findOne({ username: newUser.username });
      //if user with specified username does not exist, create user and return
      //user obj
      if (!usr) {
        await new User(newUser)
          .save().then(userObj => {
            console.log(userObj);
            return (res.status(200).json("user created"));

          });
      }
      else {
        return (res.status(200).json("user exists"));
      }
    });

  });

}); //end createUser route

//posting login credentials. If true, set authorized cookie 
//as true and create uid cooke. If not, return.
app.post('/login', async (req, res) => {

  if (!req.body.username || !req.body.password) {
    return res.status(500).json("Paramater Failure");
  }

  var result;
  var user = await User.findOne({
    username: req.body.username,
  });
  if (user) {
    flag = await bcrypt.compare(req.body.password, user.password);

    flag ? result = "Yes" : result = "No";
    if (flag) {
      //setting cookies
      res.cookie("authorized", true, {
        maxAge: 3600000, //setting cookie timeout at 1hr
        httpOnly: true
      });
      //res.cookie("userName", userObj.username);

      result = "Yes";
    }
    else {
      result = "No";
    }

    return (res.status(200).json(result));
  }
  else {
    result = "No user found!"
    return (res.status(200).json(result));
  }
}); //end login route

app.get('/sentMessages', async (req, res) => {
  var result;
  if (req.body.username) {
    var sentMessages = await Message.find({ senUsername: req.body.username }).lean();
    !sentMessages ? result = "No sent messages" : result += "sent";

    return res.status(200).json({ sentMessages: sentMessages, servMessage: result });
  }
  else {
    result = "No Username Sent";
    return (res.status(500).json(result));
  }
});
app.get('/recMessages', async (req, res) => {
  var result;
  if (req.body.username) {
    var recievedMessages = await Message.find({ recUsername: req.body.username }).lean();
    !recievedMessages ? result = "No recieved messages" : result += "recieved";
    //this returns an object of sent messages with given username, recieved messages with given username, and a server result
    //the server result should be used to let the user know weather or not the server has messages
    return res.status(200).json({ recievedMessages: recievedMessages, servMessage: result });
  }
  else {
    result = "No Username Sent";
    return (res.status(500).json(result));
  }
});

//get friends list
app.post('/getFriends', async (req, res) => {
  let result;
  var friendsList = await Friend.find({ firstUsername: req.body.username }).lean().catch((err) => { console.log(err) });

  if (!req.body.username) {
    result = "No Username sent into API!";
    return res.status(500).json(result);
  }
  else if (!friendsList) {
    result = "No Friends Found!";
    return res.status(200).json(result);
  }
  else {
    result = "Friends Found";
    return res.status(200).json(friendsList);
  }
});

app.post('/sendFriendRequest', async (req, res) => {
  let result;

  var request = {
    firstUsername: req.body.sender,
    secondUsername: req.body.reciever
  }
  var freq = await Friend(request).save().catch((err) => { console.log(err) });

  return res.status(200).json(freq);
});

app.post('/messages', async (req, res) => {
  var message = await Message(req.body).save().catch((err) => { console.log(err) });
  if (!message) {
    result = "No Message Recieved to Insert into Database";
    return res.status(500).json(result);
  }
  else {
    return res.status(201).json(message);
  }
});

//if route not exists, send user here
app.get('*', (req, res) => {
  res.status(404).json("No route created");
});
//********************CONFIG*SECTION***********************//


//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


