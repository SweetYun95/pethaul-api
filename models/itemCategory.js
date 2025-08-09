const Sequelize = require('sequelize')
module.exports = class ItemCategory extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {},
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ItemCategory',
            tableName: 'itemCategory',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      ItemCategory.belongsTo(db.Item, {
         foreignKey: 'itemId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      ItemCategory.belongsTo(db.Category, {
         foreignKey: 'categoryId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
   }
}
