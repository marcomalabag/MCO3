const mongoose = require("mongoose")

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Accounts", {
	useNewUrlParser: true
})

var DownloadedMemes = mongoose.model("DownloadedMemes", {
	meme_id:String,
	user_id:String
})

module.exports={
	DownloadedMemes
}