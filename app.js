const express = require('express');
const path = require('path');
const morgan = require('morgan');
const planRouter = require('./routes/planRoutes');
const userRouter = require('./routes/userRoutes');
const taskRouter = require('./routes/taskRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
    origin:
        ['http://localhost:5173',
            'https://planner-six-chi.vercel.app'
        ],
    credentials: true
}));

app.options('/*', cors());


// app.use is used to make use of Middleware
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    //logs information about incoming requests
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this Ip, please try again in 1 hour'
});

app.use('/api', limiter);
// Modifies incoming requests
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());


// Data Sanitization against no sql query injection

// app.use(mongoSanitize({
//     onSanitize: ({ req, key }) => {
//         console.warn(`This request[${key}] is sanitized`);
//     },
// }));
// Data Sanitization Xss
// app.use(xss());
app.use(compression());


// Routes
app.use('/api/v1/plans', planRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tasks', taskRouter);

app.use((req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;