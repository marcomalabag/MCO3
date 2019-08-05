const express = require('express')
const app = express();
const port = 9090;
const cookieParser = require('cookie-parser')
const fs = require('fs')
const mongodb = require('mongodb')

const client = mongodb.MongoClient;
const url = "mongodb://localhost:27017"
const {accounts} = require("./Accounts.js")
const mongoose = require("mongoose")


app.use(cookieParser());
app.use(express.urlencoded());
app.set('view engine', 'hbs')

function addUser(accounts){
	mongoose.connect(url, function(err){
		accounts.save(function(err, u){
			if(err) throw err;
			console.log('Document inserted:')
			mongoose.connection.close()
		})
	})
}

function findUser(accounts, filter){
	mongoose.connect(url, function(err){
		accounts.findOne(filter, function(err, u){
			if(err) throw err;
			console.log(u)
			mongoose.connection.close()
		})
	})
}

app.get('/registration', function(req, res){
	res.render('Registration.hbs', {msg:"", colors:"white"},
		function(err, html){
			res.send(html)
		})
})

app.post('/registration', function(req, res){
	var valid = "True";
	
	if(req.body.username == "" || req.body.password == ""){
		if(req.body.username == "")
		{
			res.render('Registration.hbs', {msg:"Please enter a username", colorsU:"red"},
			function(err, html){
				res.send(html)
			})
		}
		if(req.body.password == "")
		{
			res.render('Registration.hbs', {msg:"Please enter a password", colorsP:"red"},
			function(err, html){
				res.send(html)
			})
		}
		valid = "False"
	}
	if(req.body.password == "" || req.body.Confirm == ""){
		if(req.body.password == ""){
			res.render('Registration.hbs', {msg:"Please enter a password", colorsP:"red"},
			function(err, html){
				res.send(html)
			})
		}
		if(req.body.Confirm == ""){
			res.render('Registration.hbs', {msg:"Please enter a confirm password", colorsCP:"red"},
			function(err, html){
				res.send(html)
			})
		}
		valid = "False"
	}
		
	else if(req.body.Confirm != req.body.password){
		res.render('Registration.hbs', {msg:"Password and confirm password do not match. Please try again", colorsP:"red", colorsCP:"red"},
		function(err, html){
			res.send(html)
		})
		valid = "False"
	}
	
	if(req.body.Birthday == ""){
		res.render('Registration.hbs', {msg:"Please enter your birthday", colorsB:"red"},
		function(err, html){
			res.send(html)
		})
		valid = "False"
	}
	if(req.body.Email == ""){
		res.render('Registration.hbs', {msg:"Please enter an email", colorsE:"red"},
		function(err, html){
			res.send(html)
		})
		valid = "False"
	}
	else if(req.body.Email.indexOf("@") == -1){
		res.render('Registration.hbs', {msg:"Please enter a valid email", colorsE:"red"},
		function(err, html){
			res.send(html)
		})
		valid = "False"
	}
	if(valid == "True"){
		var newUser = new accounts({
			Username:req.body.username,
			Password:req.body.password,
			Birthday:req.body.Birthday,
			Email:String
		})
		addUser(newUser)
		
	}
})

app.get('/login', function(req, res){
	res.render('login.hbs', {msg:""},
		function(err, html){
			res.send(html)
		})
})

app.post('/login', function(req, res){
	//res.send(req.body.username);
	var user = new accounts({username: req.body.username, password: req.body.password})
	if(findUser(accounts, {username: req.body.username}) == null){
		res.render('login.hbs', {msg:"<h1>Account does not exit</h1>"},
		function(err, html){
			res.send(html)
		})
	}
	else{
		if(findUser(accounts, {username: req.body.password}) == user.password){
			res.render('login.hbs', {msg:"<h1>Invalid password please try again</h1>"},
			function(err, html){
			res.send(html)
			})
		}
		else{
			res.cookie('user', user)
			res.redirect('/home')
		}
	}
})


app.get('/', function(req, res){
	if(req.cookies.user == undefined){
		res.redirect('/login')
	}
	else{
		res.render('home.hbs', {username:req.cookies.user.username},
		function(err, html){
			res.send(html)
		})
		res.redirect('/home')
		res.send(req.body.username);
	}
})

app.post('/logout', function(req, res){
	res.clearCookie('user')
	res.redirect('/')
})

app.listen(port, function(){
	console.log('App is listening to port ' +port);
})
