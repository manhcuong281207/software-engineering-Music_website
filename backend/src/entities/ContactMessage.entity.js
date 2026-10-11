const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'ContactMessage',
  tableName: 'contact_messages',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar' },
    email: { type: 'varchar' },
    subject: { type: 'varchar', nullable: true },
    message: { type: 'text' },
    isRead: { type: 'boolean', default: false, name: 'is_read' },
    createdAt: { type: 'timestamptz', createDate: true, name: 'created_at' }
  }
});
