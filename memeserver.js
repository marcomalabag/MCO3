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
app.use('/profile', express.static(__dirname + '/public'))
app.use('/viewMeme', express.static(__dirname + '/public'))
app.set('view engine', 'hbs')

app.get('/likes/:Caption', function(req, res){
	
	memes.findOneAndUpdate(req.params, {$inc: {NumLikes : 1}}).then((doc)=>{
	}, (err)=>{
	})
	res.redirect('/home')
})

app.get('/download/:Picture', function(req, res){
	
	if(req.cookies.account == null){
		res.redirect('/home_u')
	}
	memes.findOneAndUpdate({Caption: req.params.Picture}, {$inc: {NumDownloads : 1}}).then((doc)=>{
	}, (err)=>{
	})
	
	memes.findOne({Caption: req.params.Picture}).then((doc)=>{
		if(doc == null){
			res.redirect('/error')
		}
		else{
			var filepath = __dirname + '/public/' + doc.Picture
			var fileName = doc.Picture
			res.download(filepath, fileName);
			next();
		}
	}, (err)=>{
		console.log(err)
	})
	
	res.redirect('/home')
})

app.get('/viewAccounts', function(req, res){
	accounts.find({loggedIn:false}).then((doc)=>{
		res.render('viewAccounts.hbs', {account:doc},
		function(err, html){
			res.send(html)
		})
	}, (err)=>{
		console.log(err)
	})
})

app.get('/delete/:Caption', function(req, res){
	
	if(req.cookies.account == undefined){
		res.redirect('/home_u')
	}
	else{
		memes.findOne(req.params).then((doc1)=>{
			if(doc1.Uploader == req.cookies.account.Username){
				memes.deleteOne(req.params).then((doc)=>{
					if(doc == null){
						res.redirect('/error')
					}
				}, (err)=>{
					console.log(err)
				})
			}
			else{
				res.redirect('/error')
			}
		}, (err)=>{
			console.log(err)
		})
	}
	
	res.redirect('/profile')
})

app.get('/viewMeme/:Picture', function(req, res){
	
	if(req.cookies.account == undefined){
		memes.findOne({Caption: req.params.Picture}).then((doc)=>{
			if(doc == null){
				res.redirect('/error')
			}
			else{
				res.render('ViewMeme_unlog.hbs', {Uploader: doc.Uploader, Caption: doc.Caption, Picture: doc.Picture, UploaderPic: doc.UploaderPic},
				function(err, html){
					res.send(html)
				})
		    } 
		}, (err)=>{
			console.log(err)
		})
	}
	else{
		memes.findOne({Caption: req.params.Picture}).then((doc)=>{
			if(doc == null){
               res.redirect('/error')
			}
			else{
				res.render('ViewMeme.hbs', {Uploader: doc.Uploader, Caption: doc.Caption, Picture: doc.Picture, UploaderPic: doc.UploaderPic, NumLikes: doc.NumLikes, NumDownloads: doc.NumDownloads},
				function(err, html){
					res.send(html)
				})
			}
		}, (err)=>{
			console.log(err)
		})
	}		
})

app.get('/viewMeme', function(req, res){
	res.render('ViewMeme.hbs', {Uploader: req.cookies.account.Username, Caption: "", Picture: "", UploaderPic: ""},
			function(err, html){
				res.send(html)
			})
})

app.get('/users', function(req, res){
	accounts.find({loggedIn:false}).then((doc)=>{
		res.render('NonUserprofile.hbs', {account: doc},
		function(err, html){
			res.send(html)
		})
	}, (err) =>{
			console.log(err)
		})
})

app.post('/editprofile', function(req, res){
	if(req.body.button == "Change Name"){
		
		accounts.findOne({Username:req.body.name}).then((doc1)=>{
			if(doc1 == null){
				memes.updateMany({Uploader: req.cookies.account.Username}, {Uploader:req.body.name}).then((doc)=>{
					console.log(doc)
				}, (err)=>{
					console.log(err)
					})
				
				accounts.findOneAndUpdate( {Username:req.cookies.account.Username}, {Username:req.body.name}).then((doc)=>{
					console.log(doc)
					}, (err)=>{
						console.log(err)
					})
				res.redirect('/logout')
			}
			else{
				res.render('edit_profile.hbs', {User:req.cookies.account.Username, username:req.cookies.account.Username, Email: req.cookies.account.Email, msg: "Name has already been used.<br> Please enter another name"},
				function(err, html){
					res.send(html)
				})
			}
		}, (err) =>{
			console.log(err)
		})
	}
	else if(req.body.button == "Change Email"){
		accounts.findOneAndUpdate( {Email: req.cookies.account.Email}, {Email:req.body.Email}).then((doc)=>{
			console.log(doc)
		}, (err)=>{
			console.log(err)
		})
		res.redirect('/logout')
	}
	else if(req.body.button == "Change Picture"){
		console.log(req.cookies.account.profilepic)
		memes.updateMany({UploaderPic: req.cookies.account.profilepic}, {UploaderPic:req.body.pic}).then((doc)=>{
			console.log(doc)
		}, (err)=>{
			console.log(err)
		})
	
		accounts.findOneAndUpdate( {profilepic: req.cookies.account.profilepic}, {profilepic:req.body.pic}).then((doc)=>{
			console.log(doc)
		}, (err)=>{
			console.log(err)
		})
		res.redirect('/logout')
	}
	else if(req.body.button == "Change Description"){
		accounts.findOneAndUpdate( {description: req.cookies.account.description}, {description:req.body.description}).then((doc)=>{
			console.log(doc)
		}, (err)=>{
			console.log(err)
		})
		res.redirect('/logout')
	}
	
})

app.get('/editprofile', function(req, res){
	res.render('edit_profile.hbs', {User:req.cookies.account.Username, username:req.cookies.account.Username, Email: req.cookies.account.Email},
	function(err, html){
		res.send(html)
	})
})

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
					if(req.body.pic == ""){
						var newUser = new accounts({
							Username:req.body.username,
							Password:req.body.password,
							Birthday:req.body.Birthday,
							Email:req.body.Email,
							description:req.body.description,
							profilepic:"Unknown.jpg",
							loggedIn:false,
						})
					}
					else if(req.body.pic.search(".jpg") == -1){
						res.render('Registration.hbs', {msg:"Please enter an image file"},
						function(err, html){
							res.send(html)
						})
					}
					else if(req.body.pic.search(".gif") == -1){
						res.render('Registration.hbs', {msg:"Please enter an image file"},
						function(err, html){
							res.send(html)
						})
					}
					else if(req.body.pic.search(".gif") == -1){
						res.render('Registration.hbs', {msg:"Please enter an image file"},
						function(err, html){
							res.send(html)
						})
					}
					else{
						var newUser = new accounts({
							Username:req.body.username,
							Password:req.body.password,
							Birthday:req.body.Birthday,
							Email:req.body.Email,
							description:req.body.description,
							profilepic:req.body.pic,
							loggedIn:false,
						})
					}
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
		res.redirect('/home_u')
	}
})

app.get('/login', function(req, res){
	res.render('login.hbs', {msg:""},
		function(err, html){
			res.send(html)
		})	
})

app.get('/profile/:Uploader', function(req, res){
	
	if(req.cookies.account == undefined){
		res.redirect('/')
	}
	else if(req.cookies.account.Username == req.params.Uploader){
		accounts.findOne({Username: req.params.Uploader}).then((doc1)=>{
			if(doc1 == null){
				res.redirect('/error')
			}
			else{
				memes.find(req.params).sort({UploadDate: -1}).then((doc)=>{
					res.render('profile.hbs', {User:doc1.Username, username:doc1.Username, picture:doc1.profilepic, description: doc1.description,
					memes: doc
				});
				}, (err) => {
					console.log(err);
				})
			}
			}, (err) =>{
				console.log(err);
			})
	}
	else{
		accounts.findOne({Username: req.params.Uploader}).then((doc1)=>{
			if(doc1 == null){
				res.redirect('/error')
			}
			else{
				memes.find(req.params).sort({UploadDate: -1}).then((doc)=>{
					res.render('NonUserprofile.hbs', {User:doc1.Username, username:doc1.Username, picture:doc1.profilepic, description: doc1.description,
					memes: doc
				});
				}, (err) => {
					console.log(err);
				})
			}
			}, (err) =>{
				console.log(err);
			})
	}
	
})	
	


app.get('/profile', function(req, res){
	
	memes.find({Uploader: req.cookies.account.Username}).sort({UploadDate: -1}).then((doc)=>{
		res.render('profile.hbs', {User:req.cookies.account.Username, username:req.cookies.account.Username, picture:req.cookies.account.profilepic, description: req.cookies.account.description,
		memes: doc
		});
		}, (err) => {
			console.log(err);
			})
})

app.post('/uploadmeme', function(req, res){
	if(req.body.button == "Home"){
		res.redirect('/home')
	}
	else if(req.body.button == "Cancel"){
		res.redirect('/uploadmeme')
	}
	else if(req.body.button == "Upload"){
		console.log(req.body.pic.search(".jpg"))
		if(req.body.pic == ""){
			res.render('upload.hbs', {msg:"Please enter a meme"},
				function(err, html){
				res.send(html)
				})
		}
		
		if(req.body.pic.search(".jpg") == -1){
			res.render('upload.hbs', {msg:"Please enter an image file for the meme"},
				function(err, html){
				res.send(html)
				})
		}
		
		else if(req.body.pic.search(".gif") == -1){
			res.render('upload.hbs', {msg:"Please enter an image file for the meme"},
				function(err, html){
				res.send(html)
				})
		}
		
		else if(req.body.pic.search(".png") == -1){
			res.render('upload.hbs', {msg:"Please enter an image file for the meme"},
				function(err, html){
				res.send(html)
				})
		}
		
		if(req.body.meme == ""){
			res.render('upload.hbs', {msg:"Please enter a caption"},
				function(err, html){
				res.send(html)
				})
		}
		
		else{
			var d = new Date();
			memes.findOne({Caption: req.body.meme}).then((doc)=>{
				if(doc == null){
					var newmemes = new memes({Caption: req.body.meme, Picture: req.body.pic, Uploader: req.cookies.account.Username, UploaderPic: req.cookies.account.profilepic, UploadDate: d, NumLikes: 0, NumDownloads: 0})
					newmemes.save().then((doc)=>{
						console.log("Successfully added: ", doc)
					}, (err) => {
						console.log(err);
						})
					res.redirect('/home')
				}
				else{
					res.render('upload.hbs', {msg: "Caption was already used<br>. Please enter an original caption"},
					function(err, html){
						res.send(html)
					})
				}
			}, (err) =>{
				console.log(err);
			})
		}			
	}
	else if(req.body.button == "LogOut"){
		res.redirect('/logout')
	}
	
})

app.get('/uploadmeme', function(req, res){
	res.render('upload.hbs', {msg:""}, 
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
	else if(req.body.button == "Upload"){
		res.redirect('uploadmeme')
	}
	else if(req.body.button == "Users"){
		res.redirect('viewAccounts')
	}
	
})

app.post('/home_u', function(req, res){
	
	if(req.body.button == "Home"){
		res.redirect('/')
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
	memes.find({}).sort({UploadDate: -1}).then((doc)=>{
		res.render('home_unlog.hbs', {memes: doc
		});
		}, (err) => {
				console.log(err);
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
		res.redirect('/profile/' + req.cookies.account.Username)
	}
    else{
		console.log(req.body.button)
	}		
})

app.get('/home', function(req, res){
	
	if(req.cookies.account == undefined){
		res.redirect('/')
	}
	else{
		memes.find({}).sort({UploadDate: -1}).then((doc)=>{
			res.render('home.hbs', {User:req.cookies.account.Username, username:req.cookies.account.Username, picture: req.cookies.account.profilepic ,Email:req.cookies.account.Email, description:req.cookies.account.description,
			memes: doc
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
						var user = new accounts({Username: req.body.username, password: req.body.password, profilepic: doc.profilepic, Email: doc.Email, description: doc.description})
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

app.get('/error', function (req, res, next) {
	res.status(404).send("File not in server!")
})
