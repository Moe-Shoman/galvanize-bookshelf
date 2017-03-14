exports.up = function(knex, Promise) {
    return knex.schema.createTable("favorites", (table) => {
        table.increments();
        table.integer('book_id')
            .references('id')
            .inTable('books')
            .notNullable()
            .onDelete('CASCADE')
            .index();
        table.integer('user_id')
            .references('id')
            .inTable('users')
            .notNullable()
            .onDelete('CASCADE')
            .index();
        table.timestamps(true, true);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("favorites");
};
