import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('devices', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.string('name');
        table.string('network_type');
        table.string('connection_type');
        table.string('dns_server');
        table.string('ip');
        table.string('gateway');
        table.string('mac');
        table.string('deviceid').unique();
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(onUpdateTrigger(knex.context.client.config.client, 'devices')),
      ),
    knex.schema.createTable('library_devices', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('libraries.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('did').index();
      table
        .foreign('did')
        .references('devices.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('library_devices'),
    knex.schema.dropTable('devices'),
  ]);
}
