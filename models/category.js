const Sequelize = require('sequelize')

module.exports = class Category extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            categoryName: {
               type: Sequelize.STRING(50),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Category',
            tableName: 'category',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      Category.belongsToMany(db.Item, {
         through: db.ItemCategory,
         foreignKey: 'categoryId',
         otherKey: 'itemId',
      })
   }
}
