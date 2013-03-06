var config = require('../config.json');
var couch_login = config.couch.pw || process.env.CLOUDANT_LOGIN  || '';
var couch_url = config.couch.url || process.env.CLOUDANT_URL || 'cs253.iriscouch.com';
var couch_db_url = 'https://' + couch_login + couch_url;
var root_url = config.app.url || '';
//var root_url ='http://' + config.app.url + '/';
console.log('articles.. ', root_url);
console.log(couch_db_url);
//var couch_db_url= process.env.CLOUDANT_URL || 'https://cs253.iriscouch.com' ;
//var couch_db_url = 'http://192.168.2.31:5984'
var nano = require('nano')(couch_db_url);
var bcrypt = require('bcrypt');
nano.db.create('users', function(err,body){
	if(!err){
		console.log('users DB created');
		}	
	else console.log('USERS: ' + err.message);

});
var udb = nano.use('users');
console.log('Connected to: ', udb.config);

var matchFrm = function (strin, typein){
	var myRegEx ="";
	switch (typein){
	case "user" :
		myRegEx=/^[a-zA-Z0-9_\-]{3,20}$/;
		break;
	case "password":
		myRegEx=/^.{3,20}$/;
		break;
	case "email":
		myRegEx=/^[\S]+@[\S]+\.[\S]+$/;	
		break;
	}
	return myRegEx.test(strin);
};
exports.signupGet = function(req, res) {
  var errors = new Array()
  res.render('signup', { title: 'Signup', username: req.body.username, 
			password: "", verify: "", email: req.body.email, Errors: errors});
};

exports.signupPost = function(req, res) {
 var errors = {};
 var has_errors =0;
 var acc;
 var acc_count =0;
		// check input
 errors.username = (matchFrm(req.body.username,"user") ?'': 'Invalid user name');
 errors.password = (matchFrm(req.body.password,"password")) ?'': 'Invalid password';
 errors.verify = (req.body.password === req.body.verify) ?'':'Passwords do not match';  
 errors.email = ((req.body.email.length===0)||matchFrm(req.body.email,"email")) ?'': 'Invalid email';  
 console.log(errors);	

for(var errtype in errors){
    has_errors +=(errors[errtype].length > 0);
};
if (!has_errors){
   udb.view('users','all_users',{key: req.body.username},function(err,body){
    if (err || body.rows.length){
     if (err) console.log('[user.check error] ',err.message);
     else{
	 //res.send("[user.check] user name taken");
	 errors={}; 
         errors.username ='User already exists';
	 res.render('signup', { title: 'Signup', username: req.body.username,
	 password: "", verify: "", email: req.body.email, Errors: errors}
	 );
	}
     }
    else{ 
    bcrypt.genSalt(10,function(err, salt){
     bcrypt.hash(req.body.password, salt, function(err, hash){
        console.log('[user.insert] ' + req.body.username);
	udb.insert({                                                          
         username: 	req.body.username,                                    
	 password: 	hash,
	 email:		req.body.email,                                    
	 firstlogin: 	new Date()},
		function(err,body){
			if(err) {
			console.log('[user.insert error] '+ err.message);
			}
			else {
			res.cookie('user',req.body.username, {path: '/', 
					httpOnly: true,  signed: true  }); //maxAge: null, expires: 0 
			res.redirect(root_url);
			}
 	}); //insert
      }); //hash
    }); //salt
   }
  });;//check

} 
else
{ 
  res.render('signup', { title: 'Signup', username: req.body.username,
  password: "", verify: "", email: req.body.email, Errors: errors});};
  
};
exports.signinPost = function(req,res) {
 if(!req.body.username) res.render('signin', {title: 'Please log in '});
 else { 
 udb.view('users','all_users',{key: req.body.username},function(err,body){
  var found = body.rows.length;
//	console.log('FOUND ' + found);
   if(!err && found){
    password = req.body.password; 
    hash = body.rows[0].value;
    console.log("Sigin: too many secrets " + password +' '+  hash);
    bcrypt.compare(password, hash, function(err, match) {
     if (match && !err){ //res.send(body.rows);
	res.cookie('user',req.body.username, {path: '/', 
		    httpOnly: true,  signed: true  }); //maxAge: null, expires: 0 
	var backURL=req.header('Referer') || '/';
//	console.log('redirecting ----- '+ backURL);
//	console.log(req.session);
//  	res.redirect('back');
	res.redirect(root_url);
	}
     else {
	   res.render('signin', {title: 'Invalid login '});
           console.log(err || 'Invalid login ');
          }
   });
   }
   else {
    res.render('signin',{title: err || 'Invalid login'});
   }
 });
 }
}
exports.signinGet = function(req,res) {
		res.render('signin', {title: 'Please log in '});
}
exports.signout = function(req,res){
		console.log(root_url + '/signup');
		res.clearCookie('user', {path: '/'});
		res.redirect(root_url);
}
exports.welcome = function(req, res) {
/*	if (matchFrm(req.query.username,"user")) 
		{res.render('welcome', {title: 'Welcome ', User: req.query.username});}
	else {res.redirect('/signup');}*/
//	console.log(req.signedCookies.user);
	if (req.signedCookies.user){
		res.render('welcome', {title: 'Welcome ', User: req.signedCookies.user});
	}
		else {res.redirect(root_url + 'sigin');}
};
exports.getUser = function(req,res){
	return(req.signedCookies.user);
}
exports.list = function(req, res){
  res.send("respond with a resource");
};
