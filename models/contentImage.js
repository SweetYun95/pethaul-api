// modules/contentImage.js
const Sequelize = require('sequelize')

module.exports = class ContentImage extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            oriImgName: {
               type: Sequelize.STRING(150),
               allowNull: false,
            },
            imgUrl: {
               type: Sequelize.STRING(255),
               allowNull: false,
            },
            // 대표 이미지 여부(선택)
            repImgYn: {
               type: Sequelize.ENUM('Y', 'N'),
               allowNull: false,
               defaultValue: 'N',
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ContentImage',
            tableName: 'contentImages',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      ContentImage.belongsTo(db.Content, {
         foreignKey: 'contentId',
         targetKey: 'id',
         onDelete: 'SET NULL',
         onUpdate: 'CASCADE',
      })
   }
}
