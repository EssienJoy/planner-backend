const express = require('express');
const authController = require('./../controllers/authController');
const taskController = require('./../controllers/taskController');

const router = express.Router({
    mergeParams: true
});

router.use(authController.protect);

router.route('/')
    .get(
        taskController.getAllTask)

    .post(
        taskController.setPlanAndTaskIds,
        taskController.createTask
    );

router.route('/:id')
    .patch(
        authController.restrictTo('user'),
        taskController.updateTask)

    .delete(
        authController.restrictTo('user'),
        taskController.deleteTask
    );

module.exports = router;