const Sequelize = require('sequelize')

module.exports = class Pet extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            petName: {
               type: Sequelize.STRING(50),
               allowNull: false,
            },
            petType: {
               type: Sequelize.STRING(50),
               allowNull: false,
            },
            breed: {
               type: Sequelize.STRING(100),
               allowNull: false,
            },
            gender: {
               type: Sequelize.CHAR(1),
               allowNull: false,
               validate: {
                  isIn: [['F', 'M']],
               },
            },
            age: {
               type: Sequelize.INTEGER.UNSIGNED,
               allowNull: false,
               validate: {
                  min: 0,
               },
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Pet',
            tableName: 'pets',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // userId를 User 테이블의 id와 연결
      Pet.belongsTo(db.User, {
         foreignKey: 'userId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
   }
}
