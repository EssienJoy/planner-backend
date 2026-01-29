const { promisify } = require('util');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES
        }
    );
};


const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);


    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' || req.secure
    });


    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            name: user.name,
            email: user.email,
            id: user._id,
        }
    });
};



exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    });

    const url = `${req.protocol}://localhost:5173/settings/user`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email or password', 400));
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');


    if (!user ||
        // if user, compare password to the hashed password 
        // in the database
        !await user.correctPassword(password, user.password)
    ) {
        return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, req, res);

});

exports.logout = catchAsync(async (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: 'success',

    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError('You are not logged in, please login to get access', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The  user belonging to the token does no longer exist,', 401));
    }
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please login again.', 401));
    };
    req.user = currentUser;
    next();

});

exports.logout = catchAsync(async (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: 'success'
    });
});


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with this email address', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    try {

        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 401));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();



    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {

    // Get the user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if the posted password is correct

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        next(new AppError('Your current password is wrong', 401));
    }

    // Update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //Log  the user in with the new updated password
    createSendToken(user, 200, req, res);
});