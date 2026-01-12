const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    completed: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,
        required: [true, 'Please provide a due date']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    plan: {
        type: mongoose.Schema.ObjectId,
        ref: 'Plan',
        required: [true, 'A task must belong to a plan']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });





const Task = mongoose.model('Task', taskSchema);

module.exports = Task;