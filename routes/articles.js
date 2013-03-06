var SHOWATONCE = 10;
var tempArticles = new Array();
var user = require('./user.js');
function isValidPath(path){
 var re = /^[a-zA-Z0-9_-]*$/;
     return re.test(path);
}
var authors = ["Joe", "Bill", "Marry", "Tom", "Jerry",
		"Jim", "Dave", "Jane", "Tarzan", "Jill"];
var makeArticle = function(id, title, content, author, updated){
                this.id = id;
                this.title = String(title);
                this.content = content;
                this.author = author;
                this.updated = updated || new Date();
}

 tempArticles.push(new makeArticle(0, 'Main page title', 'Main page text', 'author'));
for (var i=1; i <11; i+=1){
	tempArticles.push(new makeArticle(
			i,
			i,
			authors[i] + '_thinks_of_' + 
			function (){return authors[i+1] ? 
				authors[i+1]:authors[i]}(),
			authors[i]) 
	);
}
function findArticle(title){
	for(var i in tempArticles){
	if (tempArticles[i].title===String(title)) return i;}
}
//function userMode(req,res){return user.getUser(req,res)?"Logout":"Signin"};
function userMode(req,res){
	var current =user.getUser(req,res);
	this.getName=function(){return current || null};
	this.mode = current ? "Logout":"Signin";
	this.edit = current ? "Edit":"";
	this.method = "POST";
}
exports.index = function(req,res){
    var mode = new userMode(req,res); 
    res.render('wiki',{title: 'Welcome', articles: tempArticles[0], mode: mode}); 
}
exports.article = function(req,res){
    var id = findArticle(req.params.article);
	console.log(req.params.article);
    var mode = new userMode(req,res);
    if (id) res.render('wiki',{title: 'View',
			 article:  tempArticles[id], mode: mode});
    else res.redirect('/_edit/'+ req.params.article);
}
exports.edit = function(req,res){
    var path = req.params.article;
	console.log('editing --------->' + path);
  /*  var article = new makeArticle();
	article.id = tempArticles.length + 1;
	article.title = req.params.article;
	article.content = req.body.content;
	article.author = user.getUser(req,res); // get user
	article.updated = new Date(); */
	mode = new userMode(req,res);
	var acc = mode.getName();	
   if (!acc) res.redirect('signin');
   else {
   var id = findArticle(req.params.article);
   if(!id){ // new
    var article = new makeArticle(tempArticles.length + 1,
				req.params.article,
				"",
				acc,
				new Date());

    res.render('edit', {title: 'Add', article: article, mode: mode});
//	tempArticles.push(article);
//	res.redirect('/' + article.title);
   }
   else{ //edit
    var article = new makeArticle(id,
			req.params.article,
			tempArticles[id].content,
			acc,
			new Date());
	console.log(article);
    //mode.method="PUT";
    mode.method="PUT";
    res.render('edit',{title: 'Edit', article: article, mode: mode});
   }
  } 
//    tempArticles.push(article); //update db
}
exports.save= function(req,res){
  var id = findArticle(req.params.article);
  var mode = new userMode(req,res);
  var acc = mode.getName();

  if(!id) {var article = new makeArticle(
		tempArticles.length + 1,
		req.params.article,
		req.body.content,
		acc,
		new Date());
	tempArticles.push(article);}

   else {	console.log(tempArticles[id]);
		console.log('new text ' + req.body.content);
		tempArticles[id].content=req.body.content;
                tempArticles[id].author=acc;
                tempArticles[id].updated=new Date();
        }
	article=article || tempArticles[id];
	tempArticles.push(article);
	console.log(article);
	res.redirect('/' + article.title);
}
