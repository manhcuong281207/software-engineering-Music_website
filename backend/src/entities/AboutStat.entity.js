const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'AboutStat',
  tableName: 'about_stats',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    labelVi: { type: 'varchar', name: 'label_vi' },
    labelEn: { type: 'varchar', name: 'label_en' },
    value: { type: 'varchar' }, // lưu dạng string để linh hoạt: "3+", "12", "100%"
    icon: { type: 'varchar', nullable: true },
    isAutoCount: { type: 'boolean', default: false, name: 'is_auto_count' }, // true = tự tính từ số project publish
    displayOrder: { type: 'int', default: 0, name: 'display_order' }
  }
});
