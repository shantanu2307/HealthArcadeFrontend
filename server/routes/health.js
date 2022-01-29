const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Records = require('../models/recordHelper');
const Users = require('../models/userHelper')
const router = express.Router();

router.get('/records', fetchuser, async (req, res) => {
  try {
    // Fetch all records of that user 
    const records = await Records.findByUsername(req.user.username);
    return res.json({ records });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message })
  }
});

router.post('/records', fetchuser, async (req, res) => {
  try {
    // Add Record in Database
    var records = await Records.checkIfNewEntryHasToBeCreated(req.user.username, req.body.date);
    if (records.length == 0) {
      // Create Record
      await Records.createEntry(req.user.username, req.body.date);
    }
    // Update Record
    await Records.updateEntry(req.user.username, req.body.date, req.body.reps);
    //Update Highscore in table
    await Users.updateScore(req.user, req.body.reps);
    return res.json({ message: "Score has been updated" });


  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message })
  }
});


router.post('/leaderboard', fetchuser, async (req, res) => {
  try {
    // Get All Time Highest Leaderboard
    if (req.body.leaderBoardType == 'global') {
      const records = await Users.allTimeLeaderboard();
      return res.json({ records });
    }
    else {
      // To get Leaderboard For A Particular Date
      const records = await Records.getLeaderBoard(req.body.date);
      return res.json({ records });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message })
  }
});

module.exports = router;