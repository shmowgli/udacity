
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , articles = require('./routes/articles')
  , http = require('http')
  , path = require('path')
  , config = require('./config.json');

var app = express();

app.configure(function(){
  app.set('port', config.app.port || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('default'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.app.secret));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', articles.index);

app.get('/signup', user.signupGet);
app.post('/signup', user.signupPost);
app.get('/welcome', user.welcome);
//app.get('/signin', user.signinGet);
app.all('/signin', user.signinPost);
app.get('/login', user.signinGet);
app.post('/login', user.signinPost);
app.get('/logout', user.signout);

app.get('/_edit/:article', articles.edit);
app.post('/_edit/:article', articles.save);
app.put('/_edit/:article', articles.save);
app.get('/:article', articles.article);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
