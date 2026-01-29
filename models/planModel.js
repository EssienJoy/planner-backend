const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
    {
        plan: {
            type: String,
            required: [true, 'Please provide your plan'],
            trim: true,
            maxlength: [50, 'Title cannot be more than 50 characters'],
            unique: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            // select: false
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }

);
// planSchema.virtual("tasksCount", {
//     ref: "Task",
//     foreignField: "plan",
//     localField: "_id",
//     count: true,
// });


const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;