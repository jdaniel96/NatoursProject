const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new Error('problem in handler factory deleteOne'));
    }
    return res.status(204).json({
      //204 == delete
      status: 'success',
      message: `you have succesfully deleted the document: ${req.params.id}`,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateOne = (model) => async (req, res) => {
  try {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new Error('something wrong with the updateOne function'));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createOne = (model) => async (req, res) => {
  try {
    const doc = await model.create(req.body);
    res.status(201).json({
      //201 means added or created
      states: 'success',
      data: {
        doc: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getOne = (model, popOptions) => async (req, res, next) => {
  try {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // console.log(doc);
    if (!doc) {
      return next(new Error('no tours found with that id', 404));
    }

    res.status(200).json({
      status: 'success jeje omg',
      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getAll = (model) => async (req, res) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //EXECUTE QUERY
    const features = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query; //TODO explain doesn't work

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};
