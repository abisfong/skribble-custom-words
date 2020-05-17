// jshint esversion: 9
const apiFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const getModelName = Model => {
  const modelNamePlural = Model.collection.name;
  const modelNameSingular = modelNamePlural.substring(0, modelNamePlural.length - 1);
  return {
    modelNamePlural: modelNamePlural,
    modelNameSingular: modelNameSingular
  };
};

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const { modelNameSingular } = getModelName(Model);
    const newDoc = await Model.create(req.body);

    let data = {};
    data[modelNameSingular] = newDoc;

    res.status(201).json({
      status: 'success',
      data
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const { modelNamePlural } = getModelName(Model);

    // filter is intended for reviews only
    let filter = {};
    if(req.params.tourId && modelNamePlural === 'Reviews')
      filter.tour = req.params.tourId;

    const features = new apiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .select()
      .paginate();
    let docs = await features.query;
    // END OF FILTER -----------------------
    let data = {};
    data[modelNamePlural] = docs;

    res.status(200).json({
      status: 200,
      results: docs.length,
      data
    });
  });

exports.getOne = (Model, popOpts) =>
  catchAsync(async (req, res, next) => {
    const { modelNameSingular } = getModelName(Model);
    let query = Model.findById(req.params.id).populate('reviews');
    if(popOpts)
      query = query.populate();
    const doc = await query;

    if (!doc) {
      // return so response below is now sent
      throw new AppError(`No ${modelNameSingular} found with ID: ${req.params.id}`, 404);
    }

    let data = {};
    data[modelNameSingular] = doc;

    res.status(200).json({
      status: 200,
      data
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      // return so response below is now sent
      throw new AppError(`No ${modelNameSingular} found with ID: ${req.params.id}`, 404);
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const { modelNameSingular } = getModelName(Model);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      // return so response below is now sent
      throw new AppError(`No ${modelNameSingular} found with ID: ${req.params.id}`, 404);
    }

    let data = {};
    data[modelNameSingular] = doc;

    res.status(200).json({
      status: 'success',
      data
    });
  });









// EOF
