const mongoose = require("mongoose")

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Accounts", {
	useNewUrlParser: true
})

var memes = mongoose.model("memes", {
	Caption:String,
	Picture:String,
	Uploader:String,
	AccountID:String,
	UploadDate:Date
})

module.exports={
	memes
}