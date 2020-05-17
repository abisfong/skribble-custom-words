// jshint esversion: 9
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Word = require('./../models/wordModel');

exports.getAllWords = catchAsync(async (req, res, next) => {
  let query = Word.find();
  if(req.originalUrl === '/me')
    res.words = await query.find({username: req.user.username});
  else
    res.words = await query;
  next();
});

exports.createWord = catchAsync(async (req, res, next) => {
  try {
    const word = await Word.create({
      word: req.body.word,
      difficulty: req.body.difficulty.toLowerCase(),
      length: req.body.word.length,
      user: req.user._id,
      username: req.user.username
    });
  } catch(error) {
    if (error.code != 11000)
      throw error;
    res.duplicateKeyFound = true;
  }
  next();
});

exports.deleteWord = catchAsync(async (req, res, next) => {
  const word = await Word.findOne({word: req.body.word});

  if(!word)
    throw new AppError(`'${req.body.word}' not found`);

  if(req.user._id.equals(word.user))
    await Word.deleteOne({word: req.body.word});
  else
    throw new AppError(`'${req.body.word}' can only be deleted by ${req.user.username}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getCustomWords = catchAsync(async (req, res, next) => {
  const difficulties = ['easy', 'medium', 'hard'];
  let words = [];
  let query = Word.find();

  // get words based on desired difficulty
  if(difficulties.includes(req.body.difficulty)){
    let docs = await query.find({difficulty: req.body.difficulty});
    docs.forEach(doc => {
      words.push(doc.word);
    });

    // Fill in word array if less than 30
    if(req.body.fill && words.length < 30) {
      docs = await query.find({difficulty: {$ne: req.body.difficulty}});
      docs.forEach(doc => {
        words.push(doc.word);
      });
    }

  // If no difficulty specified, divide words evenly
  } else {
    const easyDocs = await query.find({difficulty: 'easy'});
    const mediumDocs = await query.find({difficulty: 'medium'});
    const hardDocs = await query.find({difficulty: 'hard'});
    const maxWords = 30;


    for(let i = 0, empty = 0; empty < 3; ++i){
      empty = 0;

      if(easyDocs[i] && words.length < maxWords)
        words.push(easyDocs[i].word);
      else
        empty++;

      if(mediumDocs[i] && words.length < maxWords)
        words.push(mediumDocs[i].word);
      else
        empty++;

      if(hardDocs[i] && words.length < maxWords)
        words.push(hardDocs[i].word);
      else
        empty++;
    }
  }

  res.status(200).json({
    status: 'success',
    results: words.length,
    data: {
      words
    }
  });
});



























// EOF
