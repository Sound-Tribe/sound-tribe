const Like = require('../models/Like');

module.exports = async (album, user) => {
    const isLiked = await Like.findOne({albumId: album._id, likeUserId: user._id});
    if(isLiked) {
        album.isLiked = true;
    }
    album.numOfLikes = (await Like.find({albumId: album._id})).length;
    console.log("this is the utils fx", album.numOfLikes)
    return album;
}