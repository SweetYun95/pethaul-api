const Sequelize = require('sequelize')

module.exports = class petImage extends Sequelize.Model {
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
            repImgYn: {
               type: Sequelize.ENUM('Y', 'N'),
               defaultValue: 'N',
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'PetImage',
            tableName: 'petImages',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      petImage.belongsTo(db.Pet, {
         foreignKey: 'petId',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
   }
}
