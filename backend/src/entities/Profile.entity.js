const { EntitySchema } = require('typeorm');

// Bảng "singleton": luôn chỉ có đúng 1 dòng, id cố định = 1.
// Việc chỉ giữ 1 dòng được đảm bảo ở tầng service (luôn upsert id=1),
// không phải constraint DB, để đơn giản.
module.exports = new EntitySchema({
  name: 'Profile',
  tableName: 'profile',
  columns: {
    id: {
      type: 'int',
      primary: true
      // KHÔNG dùng generated — luôn set cứng = 1 khi tạo/update ở service layer
    },

    // --- Hero section ---
    fullName: { type: 'varchar', name: 'full_name' },
    taglinesVi: { type: 'text', array: true, name: 'taglines_vi' },
    taglinesEn: { type: 'text', array: true, name: 'taglines_en' },
    heroImageUrl: { type: 'varchar', nullable: true, name: 'hero_image_url' },
    facebookUrl: { type: 'varchar', nullable: true, name: 'facebook_url' },
    githubUrl: { type: 'varchar', nullable: true, name: 'github_url' },
    linkedinUrl: { type: 'varchar', nullable: true, name: 'linkedin_url' },

    // --- About Me section ---
    avatarUrl: { type: 'varchar', nullable: true, name: 'avatar_url' },
    bioVi: { type: 'text', name: 'bio_vi' },
    bioEn: { type: 'text', name: 'bio_en' },
    yearsExperience: { type: 'float', default: 0, name: 'years_experience' },
    cvUrlVi: { type: 'varchar', nullable: true, name: 'cv_url_vi' },
    cvUrlEn: { type: 'varchar', nullable: true, name: 'cv_url_en' },

    // --- Contact section ---
    contactEmail: { type: 'varchar', name: 'contact_email' },
    contactPhone: { type: 'varchar', nullable: true, name: 'contact_phone' },
    contactAddress: { type: 'varchar', nullable: true, name: 'contact_address' },

    updatedAt: {
      type: 'timestamptz',
      updateDate: true,
      name: 'updated_at'
    }
  }
});
