const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating schema for friends
const Friends = new Schema(
  {
    //accepted field for handling
    //if user accepted friend req

    firstUsername:
    {
      type: String,
      required: true
    },
    secondUsername:
    {
      type: String,
      required: true
    },
    accepted:
    {
      type: Boolean,
      default: false
    },
    dateEntered:
    {
      type: Date,
      default: Date.now
    }
  });
//setting model
mongoose.model('Friends', Friends)