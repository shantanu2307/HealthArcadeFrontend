const knex = require('knex');
const config = require('../knexfile');
const db = knex(config.development);

module.exports = {
  findByUsername,
  getLeaderBoard,
  createEntry,
  updateEntry,
  checkIfNewEntryHasToBeCreated
}

// Find Records by username
async function findByUsername(username) {
  return (await db('records').where({ username }));
}

// Get the Daily LeaderBoard
async function getLeaderBoard(date) {
  return (await db.select('username', 'dayHighest').from('records').where({ date }).limit(10).orderBy('dayHighest', 'desc'));
}

// Update | Create Entry in record
async function createEntry(username, date) {
  const [id] = await db('records').insert({
    username: username,
    reps: 0,
    dayHighest: 0,
    dayRetries: 0,
    date: date
  });
  return id;
}

// Update Entry in record
async function updateEntry(username, date, newReps) {
  await db('records').where({
    username,
    date
  }).update({
    reps: db.raw('?? + ?', ['reps', newReps]),
    dayHighest: db.raw('MAX(??,?)', ['dayHighest', newReps]),
    dayRetries: db.raw('?? + 1', ['dayRetries'])
  })
}

// Check if new Entry has to be created or not
async function checkIfNewEntryHasToBeCreated(username, date) {
  return (await db('records').where({ username, date }).limit(2));
}

