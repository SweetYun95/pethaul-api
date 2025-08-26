// modules/qna.js
const Sequelize = require('sequelize')

module.exports = class Qna extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            title: {
               type: Sequelize.STRING(200),
               allowNull: false,
               defaultValue: '문의 드립니다.',
            },
            content: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
            comment: {
               type: Sequelize.TEXT,
               allowNull: true,
               defaultValue: null,
            },
         },
         {
            sequelize,
            timestamps: true, // createdAt, updatedAt
            underscored: false,
            modelName: 'Qna',
            tableName: 'qna',
            paranoid: false, // deletedAt 미사용
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      Qna.belongsTo(db.User, {
         foreignKey: 'userId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
   }
}
