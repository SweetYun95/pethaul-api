const Sequelize = require('sequelize')

module.exports = class Order extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            orderDate: {
               type: Sequelize.DATE,
               allowNull: false,
            },
            orderStatus: {
               type: Sequelize.ENUM('ORDER', 'READY', 'SHIPPED', 'DELIVERED', 'CANCEL'),
               /* ORDER: 주문 
               READY: 배송 준비
               SHIPPED: 배송 중
               DELIVERED: 배송 완료
               CANCEL: 주문 취소
               */
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Order',
            tableName: 'orders',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      Order.belongsTo(db.User, {
         foreignKey: 'userId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      Order.belongsToMany(db.Item, {
         through: db.OrderItem,
         foreignKey: 'orderId',
         otherKey: 'itemId',
      })
   }
}
