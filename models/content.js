// modules/content.js
const Sequelize = require('sequelize')

module.exports = class Content extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            title: {
               type: Sequelize.STRING(200),
               allowNull: false,
            },
            summary: {
               type: Sequelize.STRING(500),
               allowNull: false,
            },
            body: {
               type: Sequelize.TEXT,
               allowNull: true,
            },
            tag: {
               type: Sequelize.STRING(50), // GUIDE / TREND / ETC 등
               allowNull: true,
            },
            author: {
               type: Sequelize.STRING(50),
               allowNull: true,
            },
            authorId: { type: Sequelize.INTEGER, allowNull: true },
            coverUrl: {
               type: Sequelize.STRING(500),
               allowNull: true,
            },
            thumbUrl: {
               type: Sequelize.STRING(500),
               allowNull: true,
            },
            isFeatured: {
               type: Sequelize.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
            status: {
               type: Sequelize.ENUM('draft', 'published'),
               allowNull: false,
               defaultValue: 'published',
            },
            publishedAt: {
               type: Sequelize.DATE,
               allowNull: true,
            },
            slug: {
               type: Sequelize.STRING(200),
               allowNull: true,
               unique: true,
            },
         },
         {
            sequelize,
            timestamps: true, // createdAt, updatedAt
            underscored: false,
            modelName: 'Content',
            tableName: 'contents',
            paranoid: false, // deletedAt 미사용
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Content.belongsTo(db.User, {
         foreignKey: 'authorId',
         targetKey: 'id',
         onDelete: 'SET NULL',
         onUpdate: 'CASCADE',
      })
   }
}
