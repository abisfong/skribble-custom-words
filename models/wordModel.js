// jshint esversion:9
const mongoose = require('mongoose');
const validator = require('validator');

// SCHEMA OPTIONS
const toObjAndJSONOptions = {
  getters: true,
  virtuals: true,
  aliases: false,
  versionKey: true
};

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    unique: [true, 'This word exists'],
    required: [true, 'Please specify a word']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  length: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must reference a user']
  },
  username: String
}, {
  toJSON: toObjAndJSONOptions,
  toObject: toObjAndJSONOptions,
  id: false
});

module.exports = mongoose.model('Word', wordSchema);




























// EOF
