const Sequelize = require('sequelize')

module.exports = class User extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            userId: {
               type: Sequelize.STRING(255),
               allowNull: false,
               unique: true,
            },
            name: {
               type: Sequelize.STRING(255),
               allowNull: false,
            },
            password: {
               type: Sequelize.STRING(255),
               allowNull: true,
            },
            address: {
               type: Sequelize.STRING(255),
               allowNull: true,
            },
            gender: {
               type: Sequelize.CHAR(1),
               allowNull: true,
               validate: {
                  isIn: [['F', 'M']],
               },
            },
            role: {
               type: Sequelize.ENUM('ADMIN', 'USER'),
               allowNull: false,
               defaultValue: 'USER',
            },
            email: {
               type: Sequelize.STRING(100),
               allowNull: false, // 이메일은 선택 사항
               unique: true, // 이메일 중복 방지 (선택 사항)
               validate: {
                  isEmail: true, // Sequelize 내장 이메일 정규식 검증
               },
            },
         },
         {
            sequelize,
            timestamps: true, // createdAt, updatedAt
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false, // deletedAt 사용 안 함
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // 연관 관계 정의
      User.hasMany(db.Domain, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' })
      User.hasMany(db.Order, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' })
      User.hasOne(db.Cart, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' })
      User.hasMany(db.Review, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' })
      User.hasMany(db.Pet, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' })
   }
}
