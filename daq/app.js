const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const pug = require('pug');
const helmet = require('helmet');
const compression = require('compression');
const socketio = require('socket.io')(server);
const ipbus = require('./ipbus')(socketio);

// Sessions

const memoryStore = expressSession.MemoryStore;

const sessionStore = new memoryStore();

const session = expressSession({
  store: sessionStore,
  secret: 'SZH1GDhg5XuSVhSqDi2QuuYoRh1ieQDumKia6HYS',
  resave: false,
  saveUninitialized: false
});

socketio.use(function(socket, next) {
  session(socket.request, socket.request.res, next);
});

// Templates

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware

app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session);
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true,
}));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use('/bower_components',  express.static(path.join(__dirname, 'bower_components')));

// Sockets
socketio.on('connection', function (socket) {
  socket.on('change', function(i) {
    socket.request.session.optohybrid = i[0];
    socket.request.session.ipbusBlock = i[1];
    sessionStore.set(socket.request.session.uid, socket.request.session);
  });
});

app.get('*', function(req, res, next) {
  req.session.uid = req.sessionID;
  if (req.session.optohybrid) res.locals.optohybrid = req.session.optohybrid;
  else req.session.optohybrid = res.locals.optohybrid = 0;
  if (req.session.ipbusBlock) res.locals.ipbusBlock = req.session.ipbusBlock;
  else req.session.ipbusBlock = res.locals.ipbusBlock = false;
  next();
})
app.get('/', (req, res, next) => {
  res.render('overview');
});
app.get('/GLIB', function(req, res) { res.render('glib'); });
app.get('/OptoHybrid', function(req, res) { res.render('optohybrid'); });
app.get([ '/VFAT2s', '/VFAT2s/:vfat2Id' ], function(req, res) { res.render('vfat2'); });
app.get('/ADC', function(req, res) { res.render('adc'); });
app.get('/T1', function(req, res) { res.render('t1'); });
app.get('/I2C', function(req, res) { res.render('i2c'); });
app.get('/scan-I', function(req, res) { res.render('scan'); });
app.get('/scan-II', function(req, res) { res.render('ultra'); });
app.get('/rates', function(req, res) { res.render('rates'); });
app.get('/DQM', function(req, res) { res.render('dqm'); });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = server;
