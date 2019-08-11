const mongoose = require("mongoose")

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Accounts", {
	useNewUrlParser: true
})

var accounts = mongoose.model("accounts", {
	Username:String,
	Password:String,
	profilepic:String,
	Birthday:Date,
	Email:String,
	loggedIn:false,
})



module.exports={
	accounts
}
