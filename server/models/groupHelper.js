const knex = require('knex');
const config = require('../knexfile');
const db = knex(config.development);


module.exports = {
  getMembers,
  findGroup,
  createGroup,
  deleteGroup,
  validationHelper
}

//

async function validationHelper(username, tableid) {
  return db('groups').where({ username, tableid });
}

// To get Members of a particular group
async function getMembers(tableid) {
  return db.select('username').from('groups').where({ tableid });
}

//To create a group with a table id
async function createGroup(username, tableid) {
  await db('groups').insert({
    username,
    tableid
  }).then(() => {
    return getMembers(tableid);
  });

}
// To find all groups that belong to a particular user
async function findGroup(username) {
  return (await db('groups').where({ username }));
}

// To leave a group
async function deleteGroup(username, tableid) {
  await db('groups').where({ username, tableid }).del();
}









