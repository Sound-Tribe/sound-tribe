const Follow = require("../models/Follow");

module.exports = async (user) => {
    // user = object retreived from DB
    user.followers = (await Follow.find({followeeId : user._id})).length;
    user.following = (await Follow.find({followerId: user._id})).length;
    if (user.type === 'tribe') {
        user.isTribe = true;
    }
    return user;
}
