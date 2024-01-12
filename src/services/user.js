const User = require("../models/User");
const Group = require("../models/Group");

async function getUser(userId) {
    console.log("getUser", userId)
  let user = await User.findOne({ id: userId }).populate("linkedGroups");
    return user;
}

// get user or create user if not exists
async function postUser(userId, displayName, picture) {
  let user = await User.findOne({ id: userId });
  if (!user) {
    // User does not exist, so create a new user
    user = new User({
      id: userId,
      displayName: displayName,
      picture: picture,
    });
    await user.save();
  }
  return user;
}

module.exports = {
  getUser,
  postUser,
};
