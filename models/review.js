const Sequelize = require('sequelize')

module.exports = class Review extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            reviewDate: {
               type: Sequelize.DATE,
               allowNull: false,
            },
            reviewContent: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
            rating: {
               type: Sequelize.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Review',
            tableName: 'reviews',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      Review.hasMany(db.ReviewImage, { foreignKey: 'reviewId', sourceKey: 'id', onDelete: 'CASCADE' })

      Review.belongsTo(db.Item, {
         foreignKey: 'itemId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      Review.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' })
   }
}
