const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.SECRET;

const fetchuser = (req, res, next) => {
  try {
    const token = req.header('auth-token');
    if (!token) {
      res.status(401).json({ error: "Please authenticate using a valid token" })
    }
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message })
  }

}

module.exports = fetchuser;