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
    await Word.create({
      word: req.body.word.trim(),
      difficulty: req.body.difficulty.toLowerCase(),
      length: req.body.word.length,
      user: req.user._id,
      username: req.user.username
    });
  } catch(error) {
    if (error.code != 11000)
      throw error;
    res.dupKey = req.body.word.trim();
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
  const maxWords = req.body.limit || 50;
  let words = [];
  let query = Word.find();

  // shuffle function
  const shuffle = arr => {
    var currentIndex = arr.length, randomIndex, temp;

    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temp = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temp;
    }

    return arr;
  };

  // get words based on desired difficulty
  if(difficulties.includes(req.body.difficulty)){
    let docs = shuffle(await query.find({difficulty: req.body.difficulty}));

    console.log(docs);
    docs.forEach(doc => {
      if(words.length < maxWords)
        words.push(doc.word);
    });

    // Fill in word array if less than limit
    if(words.length < maxWords && req.body.fill) {
      docs = shuffle(await query.find({difficulty: {$ne: req.body.difficulty}}));
      docs.forEach(doc => {
        if(words.length < maxWords)
          words.push(doc.word);
      });
    }

  // If no difficulty specified, divide words evenly
  } else {
    const easyDocs = shuffle(await query.find({difficulty: 'easy'}));
    const mediumDocs = shuffle(await query.find({difficulty: 'medium'}));
    const hardDocs = shuffle(await query.find({difficulty: 'hard'}));


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
    words
  });
});



























// EOF
