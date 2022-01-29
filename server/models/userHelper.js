const knex = require('knex');
const config = require('../knexfile');
const db = knex(config.development);

module.exports = {
  add,
  updateScore,
  findByUsername,
  allTimeLeaderboard
}
// Add a User
async function add(user) {
  const [id] = await db('users').insert({
    username: user.username,
    name: user.name,
    password: user.password,
    highscore: 0
  });

  return id;
}

//Find By UserName
async function findByUsername(username) {
  return (await db('users').where({ username }));
}

//All time highest Leaderboard
async function allTimeLeaderboard() {
  return (await db.select('username', 'highscore').from('users').limit(10).orderBy('highscore', 'desc'));
}

// Update HighScore
async function updateScore(user, hs) {
  return (db('users').where({ username: user.username }).update({
    highscore: db.raw('MAX(??,?)', ['highscore', hs])
  }).then(() => {
    return findByUsername(user.username);
  }));
}




