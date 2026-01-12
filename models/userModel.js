const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false
        },
        confirmPassword: {
            type: String,
            required: [true, 'Confirm Password is required'],
            minlength: [8, 'Confirm Password must be at least 8 characters'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Password are not the same'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false,
        }
    },

);

userSchema.pre('save', async function (next) {
    // Only run this function if password
    //  was actually modified
    if (!this.isModified('password')) return;

    // Hash the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete password confirmed field
    this.confirmPassword = undefined;
    // next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return;

    this.passwordChangedAt = Date.now() - 1000;
    // next();
});

userSchema.pre(/^find/, async function (next) {
    this.find({ active: { $ne: false } });
});


// Instance method is amethod available
//  on all docs of a collection
userSchema.methods.correctPassword =
    async function (candidatePassword, userPassword) {
        return await
            bcrypt.compare
                (candidatePassword, userPassword);
    };

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimeStamp =
            parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changeTimeStamp;
    }

    return false;
};


userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken =
        crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


    return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;