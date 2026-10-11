const { EntitySchema } = require('typeorm');

// Chỉ có DUY NHẤT 1 tài khoản, được tạo sẵn qua seed script,
// không hỗ trợ đăng ký / quên mật khẩu.
module.exports = new EntitySchema({
  name: 'Admin',
  tableName: 'admins',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    email: {
      type: 'varchar',
      unique: true
    },
    passwordHash: {
      type: 'varchar',
      name: 'password_hash'
    },
    name: {
      type: 'varchar',
      nullable: true
    },
    createdAt: {
      type: 'timestamptz',
      createDate: true,
      name: 'created_at'
    },
    updatedAt: {
      type: 'timestamptz',
      updateDate: true,
      name: 'updated_at'
    }
  }
});
