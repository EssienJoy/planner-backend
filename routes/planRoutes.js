const express = require('express');
const planController = require('../controllers/planController');
const authController = require('../controllers/authController');
const taskController = require('../controllers/taskController');
const taskRouter = require('../routes/taskRoutes');

const router = express.Router({
    mergeParams: true
});

router.use(authController.protect);
router.use('/:planId/tasks', taskRouter);


router.route('/')
    .get(
        planController.getAllPlans)
    .post(
        taskController.setPlanAndTaskIds,
        planController.createPlan);

router.route('/:id')
    .get(
        planController.getPlan)
    .patch(
        authController.restrictTo('user'),
        planController.updatePlan)

    .delete(
        authController.restrictTo('user'),
        planController.deletePlan);


module.exports = router;
