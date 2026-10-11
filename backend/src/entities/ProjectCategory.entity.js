const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'ProjectCategory',
  tableName: 'project_categories',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    slug: { type: 'varchar', unique: true }, // "web", "web-app", "mobile-app"
    nameVi: { type: 'varchar', name: 'name_vi' },
    nameEn: { type: 'varchar', name: 'name_en' },
    displayOrder: { type: 'int', default: 0, name: 'display_order' }
  },
  relations: {
    projects: {
      type: 'one-to-many',
      target: 'Project',
      inverseSide: 'category'
    }
  }
});
