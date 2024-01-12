const router = require("express").Router();
const User = require("../models/User");
const { joinWhatsAppGroup, client } = require("../services/whatsapp");
const Group = require("../models/Group");

router.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  // Fetch user and their groups from the database
  const user = req.user;
  console.log(user)
  res.render("dashboard", { user });
});

router.post("/link-group", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  // recieve group link from form
  const { groupLink } = req.body;
  const userId = req.user.id;
  try {
    const groupId = await joinWhatsAppGroup(groupLink);
    if (groupId) {
      // if group exists, end
      if (await Group.exists({ id: groupId })) {
        console.log(`Group ${groupId} already exists.`)
        return res.redirect("/dashboard");
      }
      // Create and save the group with the client as admin
      const newGroup = new Group({
        id: groupId,
        name: groupId,
        admin: userId,
      });
      await newGroup.save();

      await User.findOneAndUpdate({id: userId}, {
        $push: { linkedGroups: newGroup._id },
      });
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error linking WhatsApp group:", error);
    res.status(500).send("Unable to link WhatsApp group");
  }
});

module.exports = router;
