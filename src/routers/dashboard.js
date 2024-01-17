const router = require("express").Router();
const User = require("../models/User");
const Participant = require("../models/Participant");
const { joinWhatsAppGroup, client } = require("../services/whatsapp");
const Group = require("../models/Group");

router.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  // Fetch user and their groups from the database
  const user = req.user;

  // Fetch groups from the database
  const groups = await Group.find({ admin: user.id });
  console.log(user)
  res.render("dashboard", { user, groups });
});

router.get('/dashboard/:groupId', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  const groupId = req.params.groupId;
  const userId = req.user.id;
  try {
      // Fetch group details from the database using groupId
      const group = await Group.findOne({ id: groupId, admin: userId });
      console.log("group", group);
      // Fetch all participants in the group
      const participants = Participant.find({ group: group.id });

      
      // Render a template for the group's dashboard
      // You'll need to create a separate Pug template for this or use an existing one
      res.render('dashboard/group', { group, participants });
  } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).send('Error fetching group');
  }
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
