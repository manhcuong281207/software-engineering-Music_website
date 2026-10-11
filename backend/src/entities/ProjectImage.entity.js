const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'ProjectImage',
  tableName: 'project_images',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    imageUrl: { type: 'varchar', name: 'image_url' }, // Cloudinary URL
    captionVi: { type: 'varchar', nullable: true, name: 'caption_vi' },
    captionEn: { type: 'varchar', nullable: true, name: 'caption_en' },
    displayOrder: { type: 'int', default: 0, name: 'display_order' }
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'Project',
      joinColumn: { name: 'project_id' },
      onDelete: 'CASCADE',
      nullable: false
    }
  }
});
