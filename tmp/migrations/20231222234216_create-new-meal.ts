import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('newMeal', (table) =>{
        table.uuid('id').primary()
        table.uuid('user_id').index()
        table.text('name').notNullable()
        table.text('description').notNullable()
        table.boolean('isOnDiet').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('newMeal')
}