const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating schema for clients
const Messages = new Schema(
  {
    senUsername:
    {
      type: String,
      required: true
    },
    recUsername:
    {
      type: String,
      required: true
    },
    message:
    {
      type: String,
      required: true
    },
    dateEntered:
    {
      type: Date,
      default: Date.now
    }
  });
//setting model
mongoose.model('Messages', Messages)