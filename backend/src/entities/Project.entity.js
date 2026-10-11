const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Project',
  tableName: 'projects',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    slug: { type: 'varchar', unique: true },

    titleVi: { type: 'varchar', name: 'title_vi' },
    titleEn: { type: 'varchar', name: 'title_en' },

    shortDescriptionVi: { type: 'text', name: 'short_description_vi' },
    shortDescriptionEn: { type: 'text', name: 'short_description_en' },

    fullDescriptionVi: { type: 'text', name: 'full_description_vi' },
    fullDescriptionEn: { type: 'text', name: 'full_description_en' },

    lessonsLearnedVi: { type: 'text', nullable: true, name: 'lessons_learned_vi' },
    lessonsLearnedEn: { type: 'text', nullable: true, name: 'lessons_learned_en' },

    coverImageUrl: { type: 'varchar', name: 'cover_image_url' }, // Cloudinary URL
    githubUrl: { type: 'varchar', nullable: true, name: 'github_url' },
    demoUrl: { type: 'varchar', nullable: true, name: 'demo_url' },

    isFeatured: { type: 'boolean', default: false, name: 'is_featured' },
    isPublished: { type: 'boolean', default: false, name: 'is_published' },
    displayOrder: { type: 'int', default: 0, name: 'display_order' },

    createdAt: { type: 'timestamptz', createDate: true, name: 'created_at' },
    updatedAt: { type: 'timestamptz', updateDate: true, name: 'updated_at' }
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'ProjectCategory',
      joinColumn: { name: 'category_id' },
      nullable: false
    },
    images: {
      type: 'one-to-many',
      target: 'ProjectImage',
      inverseSide: 'project'
    },
    technologies: {
      type: 'many-to-many',
      target: 'Technology',
      joinTable: {
        name: 'project_technologies',
        joinColumn: { name: 'project_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'technology_id', referencedColumnName: 'id' }
      }
    }
  },
  indices: [
    { name: 'idx_projects_published_featured', columns: ['isPublished', 'isFeatured'] }
  ]
});
