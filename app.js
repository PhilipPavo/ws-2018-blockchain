const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const router = express.Router();
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const pollsRouter = require('./routes/polls')
const profileRouter = require('./routes/profile');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const app = express();

const BlockChainApi = require('./blockchain/BlockChainApi');
const BlockChainNode = require('./blockchain/BlockChainNode');

const api = new BlockChainApi();
const blockchain = new BlockChainNode(api);
api.blockchain = blockchain;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./blockchain/User');
const user = new User();

app.use(function(req, res, next) {
    req.user = user;
    req.api = api;

    if(!req.user.data && req.originalUrl !== '/auth' && req.originalUrl !== '/api/auth'){
        res.redirect('/auth');
    }

    next();
});

app.use('/api', apiRouter(api));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/profile', profileRouter);
app.use('/polls', pollsRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
