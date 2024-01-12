const Group = require("./models/Group");
const User = require("./models/User");
const mongoose = require("mongoose");
const Participant = require("./models/Participant");

async function createGroup(groupId, groupName, maxPoints = 5) {

    //check mongoose connection
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    //check if group exists
    const group = Group.findOne({ id: groupId }).catch((err) => {
        console.log(err);
        return null;
    });

    if (!group) {
        //add group to database
        const newGroup = new Group({
            id: groupId,
            name: groupName,
            maxPoints: maxPoints
        });
        newGroup.save();
    }

}

async function getGroup(groupId) {

    //check mongoose connection
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    //check if group exists
    let group = await Group.findOne({ id: groupId }).catch((err) => {
        console.log(err);
        return null;
    });

    if (!group) {
        //add group to database
        const newGroup = new Group({
            id: groupId,
            name: groupId,
        });
        await newGroup.save();
        console.log(`New group added with ID: ${groupId}`);
        group = newGroup;
    }
    return group;
}

async function addStreak(participantId, participantName, groupId, hasMedia, maxPoints = 5) {
   
    //check mongoose connection
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    //check if participant exists
    const participant = await Participant.findOne({ id: participantId, group: groupId }).catch((err) => {
        console.log(err);
        return null;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
        if (participant) {
            //check if streak is still valid
            //if no streak, set streak to 1
            if (!participant.lastStreak) {
                participant.lastStreak = new Date(today - 1000*60*60*24);
            }
            const lastStreakDate = new Date(participant.lastStreak);
            lastStreakDate.setHours(0, 0, 0, 0);

            if (hasMedia && lastStreakDate < today  ) {
                //if is more than 1 day, reset streak
                if (lastStreakDate < new Date(today - 1000*60*60*24)) {
                    participant.streak = 0;
                }
                //add points to participant
                console.log("Streak added to participant", participantId, "of", )
                participant.streak++;
                participant.lastStreak = today;
            }
            //add points to participant
            if (participant.pointsToday < maxPoints) {
                participant.points++;            
            }

            participant.save();
        }
        else {
            //add participant to database
            const newParticipant = new Participant({
                id: participantId,
                name: participantName || participantId,
                streak: hasMedia ? 1 : 0,
                lastStreak: hasMedia ? today : null,
                points: 1,
                group: groupId
            });
            
            newParticipant.save();
        }
    
}

async function getParticipantsByPoints(groupId) {
    //check mongoose connection
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    const participants = await Participant.find({ group: groupId }).sort({ points: -1, streak: -1 }).catch((err) => {
        console.log(err);
        return null;
    });
    return participants;
}

async function getLeaderboard(groupId) {
    const participants = await getParticipantsByPoints(groupId);
    let leaderboard = "";
    participants.forEach((participant, index) => {
        leaderboard += `${index + 1}. ${participant.name} - ${participant.points} points\n`;
    });
    return leaderboard;
}


module.exports = {
    addStreak,
    getLeaderboard,
    createGroup,
    getGroup
};
