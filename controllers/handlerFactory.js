// const { deleteModel } = require("mongoose");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: null
    });

});


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc =
        await Model.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true,
                runValidators: true
            }
        );
    if (!doc) {
        return next(new AppError('No document found with that id', 404));
    }
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });

});


exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });

});

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        console.log(req.params);

        let query = Model.findById(req.params.id);
        if (populateOptions)
            query = query.populate(populateOptions);
        const doc =
            await query;

        if (!doc) {
            return next(new AppError('No document found with that id', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });

    });

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};

    if (req.params.planId) {
        filter = { plan: req.params.planId };
    }

    if (req.params.userId) {
        filter = { user: req.params.userId };
    }

    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const features =
        new ApiFeatures(Model.find(filter), req.query).filter().sort().limit().pagination();

    // Execute query
    const doc = await features.query;
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            doc
        }
    });
});