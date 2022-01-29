const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Users = require('../models/userHelper')
const Groups = require('../models/groupHelper');
const router = express.Router();

//Add a random generator @KshitijVikramSingh

router.post('/getteamleaderboard', fetchuser, async (req, res) => {
  try {
    // Return all time highest
    const members = await Groups.getMembers(req.body.teamid);
    var answer = [];
    for (var i = 0; i < members.length; i++) {
      const data = await Users.findByUsername(members[i].username);
      answer.push({
        username: members[i].username,
        highscore: data[0].highscore
      })
    }
    return res.send({ answer });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// ALlow user to create a team
router.get('/createteam', fetchuser, async (req, res) => {
  try {
    const teamid = req.user.username + Date.now();
    const records = await Groups.validationHelper(req.user.username, teamid);
    if (records.length > 0) {
      return res.send({ message: "Already in the group" });
    }
    await Groups.createGroup(req.user.username, teamid);
    return res.send({ teamid });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
})

router.get('/findmembers', fetchuser, async (req, res) => {
  try {
    const data = await Groups.getMembers(req.body.teamid);
    return res.send({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
});

// User can join a team with a given teamid 
router.post('/jointeam', fetchuser, async (req, res) => {
  try {
    const records = await Groups.validationHelper(req.user.username, req.body.teamid);
    if (records.length > 0) {
      return res.send({ message: "Already in the group" });
    }
    const data = await Groups.createGroup(req.user.username, req.body.teamid);
    return res.send({ data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }

});


router.get('/findteam', fetchuser, async (req, res) => {
  try {
    const data = await Groups.findGroup(req.user.username);
    return res.send({ data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

// User can remove himself from a given team with teamid 
router.post('/deleteteam', fetchuser, async (req, res) => {
  try {
    await Groups.deleteGroup(req.user.username, req.body.teamid);
    return res.send({ message: "Successfully deleted team " });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

module.exports = router;