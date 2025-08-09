const Sequelize = require('sequelize')

module.exports = class ReviewImage extends Sequelize.Model {
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
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ReviewImage',
            tableName: 'reviewImages',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      ReviewImage.belongsTo(db.Review, {
         foreignKey: 'reviewId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
   }
}
