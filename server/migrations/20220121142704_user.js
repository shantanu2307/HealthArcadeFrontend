
exports.up = function (knex) {
  return knex.schema.createTable('users', tbl => {
    tbl.increments();
    tbl.text('name', 128).notNullable();
    tbl.string('username').notNullable().unique();
    tbl.string('password').notNullable();
    tbl.integer('highscore', 7);
    tbl.timestamps(true, true);
  }).createTable('records', tbl => {
    tbl.increments();
    tbl.string('username').notNullable().references('username').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('reps', 7);
    tbl.integer('dayHighest', 7);
    tbl.integer('dayRetries', 7);
    tbl.string('date')
  }).createTable('groups', tbl => {
    tbl.string('username').notNullable();
    tbl.string('tableid').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('records').dropTableIfExists('users');
};
