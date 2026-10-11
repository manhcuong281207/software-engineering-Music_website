const { EntitySchema } = require('typeorm');

// Dùng chung cho cả tech-stack của Project và Skills section,
// tránh phải nhập tên/icon công nghệ 2 lần ở 2 chỗ.
module.exports = new EntitySchema({
  name: 'Technology',
  tableName: 'technologies',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar', unique: true }, // "React", "PostgreSQL", "Figma"
    iconSlug: { type: 'varchar', name: 'icon_slug' } // map ra devicon/simple-icons, vd: "react"
  },
  relations: {
    skillGroup: {
      type: 'many-to-one',
      target: 'SkillGroup',
      joinColumn: { name: 'skill_group_id' },
      nullable: false
    },
    projects: {
      type: 'many-to-many',
      target: 'Project',
      inverseSide: 'technologies'
    },
    skill: {
      type: 'one-to-one',
      target: 'Skill',
      inverseSide: 'technology'
    }
  }
});
