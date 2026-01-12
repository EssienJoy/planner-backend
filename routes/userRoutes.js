const express = require('express');
const userController = require('./../controllers/userController');
const authController = require("../controllers/authController");
const planRouter = require("../routes/planRoutes");
const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);



router.use(authController.protect);
router.use('/:userId/plans', planRouter);
router.get('/logout', authController.logout);

router.patch('/updateMyPassword',
    authController.restrictTo('user'),
    authController.updatePassword);

router.get('/me',
    userController.getMe,
    userController.getUser
);

router.patch('/updateMe',
    authController.restrictTo('user'),
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);

router.delete('/deleteMe',
    authController.restrictTo('user'),
    userController.deleteMe
);

router.route('/')
    .get(userController.getAllUsers)
    .post(authController.restrictTo('admin'),
        userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .delete(
        authController.restrictTo('admin'),
        userController.deleteUser
    );


module.exports = router;
