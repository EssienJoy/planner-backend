const Task = require("../models/taskModel");
const factory = require('./handlerFactory');

exports.getAllTask = factory.getAll(Task);

exports.setPlanAndTaskIds = (req, res, next) => {
    if (!req.body.plan) req.body.plan = req.params.planId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};
exports.createTask = factory.createOne(Task);
exports.updateTask = factory.updateOne(Task);
exports.deleteTask = factory.deleteOne(Task);
