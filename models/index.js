// models/index.js
const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const User = require('./user')
const Item = require('./item')
const Cart = require('./cart')
const CartItem = require('./cartItem')
const Category = require('./category')
const ItemCategory = require('./itemCategory')
const Order = require('./order')
const OrderItem = require('./orderItem')
const ItemImage = require('./itemImage')
const Review = require('./review')
const ReviewImage = require('./reviewImage')
const Pet = require('./pet')
const PetImage = require('./petImage')
const Domain = require('./domain')
const Like = require('./like')
const Content = require('./content')
const Qna = require('./qna')

const db = {}
const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize

// Expose models on db
/*
db.User = User
db.Item = Item
db.Cart = Cart
... 이하 동일
과 같은 역할
*/
Object.assign(db, {
   User,
   Item,
   Cart,
   CartItem,
   Category,
   ItemCategory,
   Order,
   OrderItem,
   ItemImage,
   Review,
   ReviewImage,
   Pet,
   PetImage,
   Domain,
   Like,
   Content,
   Qna,
})

// Initialize
User.init(sequelize)
Item.init(sequelize)
Cart.init(sequelize)
CartItem.init(sequelize)
Category.init(sequelize)
ItemCategory.init(sequelize)
Order.init(sequelize)
OrderItem.init(sequelize)
ItemImage.init(sequelize)
Review.init(sequelize)
ReviewImage.init(sequelize)
Pet.init(sequelize)
PetImage.init(sequelize)
Domain.init(sequelize)
Like.init(sequelize)
Content.init(sequelize)
Qna.init(sequelize)

// Associate
User.associate(db)
Item.associate(db)
Cart.associate(db)
CartItem.associate(db)
Category.associate(db)
ItemCategory.associate(db)
Order.associate(db)
OrderItem.associate(db)
ItemImage.associate(db)
Review.associate(db)
ReviewImage.associate(db)
Pet.associate(db)
PetImage.associate(db)
Domain.associate(db)
Like.associate(db)
Content.associate(db)
Qna.associate(db)

module.exports = db
