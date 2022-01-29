const express = require('express');
const router = express.Router();
require('dotenv').config();
const Users = require('../models/userHelper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = process.env.SECRET;

router.post('/signup', [
  body('username', 'Enter a valid Username').isLength({ min: 5 }),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
  body('name', 'Enter a valid name').isLength({ min: 3 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // checking if a user with entered email already exists
      let user = await Users.findByUsername(req.body.username);
      if (user.length > 0) {
        return res.status(400).json({ error: "Sorry! A user with given username already exists" })
      }

      //hashing password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //creating a new user
      const id = await Users.add({
        name: req.body.name,
        username: req.body.username,
        password: secPass
      });

      const data = {
        user: {
          username: req.body.username
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      return res.json({ authToken });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message })
    }
  });


router.post('/login', [
  body('username', 'Enter a valid username').exists(),
  body('password', 'Password cannot be empty').exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //Find user on username
      var user = await Users.findByUsername(req.body.username);
      //No user found
      if (user.length == 0) {
        throw new Error('Enter Valid Credentials');
      }
      user = user[0];
      const comparePassword = await bcrypt.compare(req.body.password, user.password);

      //Password doesnt match
      if (!comparePassword) {
        throw new Error('Enter Valid Credentials');
      }


      // Generate JWT
      const data = {
        user: {
          username: req.body.username
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);

      return res.json({ authToken });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message })
    }

  });



router.get('/user', fetchuser, (req, res) => {
  Users.findByUsername(req.user.username).then(user => {
    return res.status(200).json(user);
  }).catch(err => {
    return res.status(500).json({ message: "Cannot Retrieve User Details" })
  });
})


module.exports = router;