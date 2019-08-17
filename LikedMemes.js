const mongoose = require("mongoose")

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Accounts", {
	useNewUrlParser: true
})

var LikedMemes = mongoose.model("LikedMemes", {
	Caption:String,
	user:String,
})

module.exports={
	LikedMemes
}
