const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'RoadmapItem',
  tableName: 'roadmap_items',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    titleVi: { type: 'varchar', name: 'title_vi' },
    titleEn: { type: 'varchar', name: 'title_en' },
    descriptionVi: { type: 'text', name: 'description_vi' },
    descriptionEn: { type: 'text', name: 'description_en' },
    status: {
      type: 'enum',
      enum: ['COMPLETED', 'IN_PROGRESS', 'PLANNED'],
      default: 'PLANNED'
    },
    periodLabel: { type: 'varchar', nullable: true, name: 'period_label' }, // vd: "2024 - 2025", hiển thị tự do
    displayOrder: { type: 'int', default: 0, name: 'display_order' }
  }
});
