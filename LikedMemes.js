const mongoose = require("mongoose")

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Accounts", {
	useNewUrlParser: true
})

var LikedMemes = mongoose.model("LikedMemes", {
	meme_id:String,
	user_id:String
})

module.exports={
	LikedMemes
}
