var createError = require('http-errors');
var cors = require('cors');
var express = require('express');
var path = require('path');
const bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var blogsRouter = require('./routes/blogs');
var productsRouter = require('./routes/products');
var clientsRouter = require('./routes/clients');
var partenairesRouter = require('./routes/partenaires');
var kpisRouter = require('./routes/kpis');
var contactsRouter = require('./routes/contacts');

var app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://mila:MilaGroupB@millagroup-shard-00-00-xzdpk.mongodb.net:27017,millagroup-shard-00-01-xzdpk.mongodb.net:27017,millagroup-shard-00-02-xzdpk.mongodb.net:27017/mila?ssl=true&replicaSet=MillaGroup-shard-0&authSource=admin&retryWrites=true&w=majority');
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/blogs', blogsRouter);
app.use('/products', productsRouter);
app.use('/clients', clientsRouter);
app.use('/partenaires', partenairesRouter);
app.use('/kpis', kpisRouter);
app.use('/contacts', contactsRouter);

var port = process.env.PORT || 3001;
app.listen(port,()=>{
    console.log("server started")
});

app.use((req,res,next)=>{
    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Headers','Content-Type');
    res.set('Content-type','application/json');
    next();
});


module.exports = app;
