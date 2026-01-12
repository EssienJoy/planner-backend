const Plan = require('../models/planModel');
const factory = require('./handlerFactory');


exports.getAllPlans = factory.getAll(Plan);

exports.getPlan = factory.getOne(Plan);
exports.createPlan = factory.createOne(Plan);
exports.updatePlan = factory.updateOne(Plan);
exports.deletePlan = factory.deleteOne(Plan);
