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

 tempArticles.push(new makeArticle(0, '', 'Main page text', 'author'));
for (var i=1; i <11; i+=1){
	tempArticles.push(new makeArticle(
			i,
			'title_' + i,
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
    res.render('wiki',{title: 'Welcome', article: tempArticles[0], mode: mode}); 
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
	mode = new userMode(req,res);
	var acc = mode.getName();	
   if (!acc) res.redirect('signin');
   else {
   if (req.params.article==='_edit'){//main page
	var article = new makeArticle(0,'',tempArticles[0].content,
			acc,new Date());
        res.render('edit',{title: 'Edit', article: article, mode: mode}); 
   }
  else {
   var id = findArticle(req.params.article);
	console.log('ID.....' + req.params.article);
   if(!id){ // new
    var article = new makeArticle(tempArticles.length + 1,
				req.params.article,
				"",
				acc,
				new Date());

    res.render('edit', {title: 'Add', article: article, mode: mode});
   }
   else{ //edit
    var article = new makeArticle(id,
			req.params.article,
			tempArticles[id].content,
			acc,
			new Date());
	console.log(article);
    //mode.method="PUT";
    mode.method="POST";
    res.render('edit',{title: 'Edit', article: article, mode: mode});
   }
  } 
 }//    tempArticles.push(article); //update db
}
exports.save= function(req,res){
  var id = findArticle(req.params.article);
  var mode = new userMode(req,res);
  var acc = mode.getName();
  var article ={};
  if(!id) {     article = new makeArticle(
		tempArticles.length + 1,
		req.params.article,
		req.body.content,
		acc,
		new Date());
	tempArticles.push(article);}

   else {	//console.log(tempArticles[id]);
		tempArticles[id].content=req.body.content;
                tempArticles[id].author=acc;
                tempArticles[id].updated=new Date();
        }
	article=article.title? article: tempArticles[id];
	res.redirect('/' + article.title);
}
