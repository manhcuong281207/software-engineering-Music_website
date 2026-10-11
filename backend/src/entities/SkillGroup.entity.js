const { EntitySchema } = require('typeorm');

// Frontend / Backend / DevOps / Design / Tool ...
module.exports = new EntitySchema({
  name: 'SkillGroup',
  tableName: 'skill_groups',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    nameVi: { type: 'varchar', name: 'name_vi' },
    nameEn: { type: 'varchar', name: 'name_en' },
    icon: { type: 'varchar', nullable: true },
    displayOrder: { type: 'int', default: 0, name: 'display_order' }
  },
  relations: {
    technologies: {
      type: 'one-to-many',
      target: 'Technology',
      inverseSide: 'skillGroup'
    }
  }
});
