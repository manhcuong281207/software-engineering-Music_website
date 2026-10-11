const { EntitySchema } = require('typeorm');

// Chỉ những Technology nào bạn MUỐN hiện ở phần Skills mới cần
// có 1 dòng Skill tương ứng (không phải Technology nào cũng có Skill).
module.exports = new EntitySchema({
  name: 'Skill',
  tableName: 'skills',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    proficiencyLevel: { type: 'int', default: 3, name: 'proficiency_level' }, // 1-5
    displayOrder: { type: 'int', default: 0, name: 'display_order' }
  },
  relations: {
    technology: {
      type: 'one-to-one',
      target: 'Technology',
      joinColumn: { name: 'technology_id' },
      onDelete: 'CASCADE',
      nullable: false,
      unique: true
    }
  }
});
