const express = require('express')
const app = express();
const port = 9090;
const cookieParser = require('cookie-parser')
const fs = require('fs')
const {accounts} = require("./Accounts.js")
const {memes} = require("./memes.js")
const {LikedMemes} = require("./LikedMemes.js")


app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'hbs')

function redirection(req, res){
	res.render('login.hbs', {msg:"Account does not exist"},
	function(err, html){
		res.send(html)
	})
}

function findUser(accounts, filter){
	mongoose.connect(url, function(err){
		accounts.findOne(filter, function(err, u){
			if(err) throw err;
				if(u == null){
					return filter;
				}
			mongoose.connection.close()
		})
	})
}

app.get('/registration', function(req, res){
	res.render('Registration.hbs', {msg:"", colorsU:"white", colorsP:"white", colorsCP:"white", colorsB:"white", colorsE:"white"},
		function(err, html){
			res.send(html)
		})
		
})

app.post('/registration', function(req, res){
	var valid = "True";
	if(req.body.button == "Signup"){
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
			accounts.findOne({Username:req.body.username}).then((doc)=>{
				if(doc == null){
					var newUser = new accounts({
						Username:req.body.username,
						Password:req.body.password,
						Birthday:req.body.Birthday,
						Email:req.body.Email,
						profilepic:req.body.pic,
						loggedIn:false,
					})
					newUser.save().then((doc)=>{
						console.log("Successfully added: ", doc)
					}, (err) => {
						console.log(err);
					})
					res.redirect('/login')
				}
				else{
					res.render('Registration.hbs', {msg:"Account already exists", colorsU:"red", colorsP:"red", colorsCP:"red", colorsB:"red", colorsE:"red"},
					function(err, html){	
						res.send(html)
					})
					valid = "False"
				}
			}, (err) => {
				console.log(err);
			})
		}
	}
	else if(req.body.button == "cancel"){
		res.redirect('/registration')
	}
	else if(req.body.button == "Home"){
		res.redirect('/')
	}
})

app.get('/login', function(req, res){
	res.render('login.hbs', {msg:""},
		function(err, html){
			res.send(html)
		})	
})

app.get('/profile', function(req, res){
	res.render('profile.hbs', {User:req.cookies.account.Username, username:req.cookies.account.Username, picture:req.cookies.account.profilepic},
		function(err, html){
			res.send(html)
		})
})

app.post('/profile', function(req, res){
	if(req.body.button == "Home"){
		res.redirect('/home')
	}
	else if(req.body.button == "LogOut"){
		res.redirect('/logout')
	}
	else if(req.body.button == "EditProfile"){
		res.redirect('/editprofile')
	}
})

app.post('/home_u', function(req, res){
	
	if(req.body.button == "Home"){
		res.render('home_unlog.hbs', 
		function(err, html){
			res.send(html)
		})
	}
	else if(req.body.button == "Login")
	{
	   res.redirect('/login')
	}
	else if(req.body.button == "Sign Up"){
		res.redirect('/registration')
	}		
})

app.get('/home_u', function(req, res){
	/*
	if(req.cookies.user == undefined){
		res.redirect('/')
	}
	*/
		res.render('home_unlog.hbs', 
		function(err, html){
			res.send(html)
		})
})

app.post('/home', function(req, res){
	
	if(req.body.button == "Home"){
		res.redirect('/home')
	}
	else if(req.body.button == "LogOut")
	{
	   res.redirect('/logout')
	}
	else if(req.body.button == "Profile"){
		res.redirect('/profile')
	}		
})

app.get('/home', function(req, res){
	
	if(req.cookies.account == undefined){
		res.redirect('/')
	}
	else{
		var i;
		accounts.find({loggedIn:false}).then((doc)=>{
			res.render('home.hbs', {User:req.cookies.account.Username, username:req.cookies.account.Username, picture:req.cookies.account.profilepic,
			user: doc
			});
			}, (err) => {
				console.log(err);
			})
	}
})

app.post('/login', function(req, res){
	//res.send(req.body.username);
	if(req.body.button == "Home"){
		res.redirect('/home_u')
	}
	else if(req.body.button == "Login"){
		accounts.findOne({Username:req.body.username}).then((doc)=>{
			if(doc == null){
				res.render('login.hbs', {msg:"Account does not exist"},
				function(err, html){
				res.send(html)
				})
			}
			else{
				accounts.findOne({Password:req.body.password}).then((doc)=>{
					if(doc == null){
						res.render('login.hbs', {msg:"Invalid password please try again"},
						function(err, html){
							res.send(html)
						})
					}
					else{
						var user = new accounts({Username: req.body.username, password: req.body.password, profilepic: doc.profilepic})
						accounts.findOneAndUpdate( {Username:req.body.username}, {loggedIn:true}).then((doc)=>{
							
						}, (err)=>{
							console.log(err)
						})
						res.cookie('account', user)
						res.redirect('/')
					}
				}, (err)=>{
					console.log(err)
				})
			}
		}, (err)=>{
			console.log(err)
		accounts.closeDatabase();	
		})
	}
	else if(req.body.button == "Register"){
		res.redirect('/registration')
	}
	else if(req.body.button == "Cancel"){
		res.redirect('/')
	}
	
	
})


app.get('/', function(req, res){
	if(req.cookies.account == undefined){
		res.redirect('/home_u')
	}
	else{
		res.redirect('/home')
	}
})

app.get('/logout', function(req, res){
	accounts.findOneAndUpdate( {Username:req.cookies.account.Username}, {loggedIn:false}).then((doc)=>{
		
	}, (err)=>{
		console.log(err)
	})
	res.clearCookie('account')
	res.redirect('/')
})


app.listen(port, function(){
	console.log('App is listening to port ' +port);
})
