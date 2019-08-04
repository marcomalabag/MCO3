const mongoose = require("mongoose")


var accounts = mongoose.model("accounts", {
	Username:String,
	Password:String,
	Birthday:Date,
	Email:String,
	/*memes:[{
		Caption:String,
		Picture:String,
		fileMemeName:String
	}]
	*/
})

module.exports={
	accounts
}