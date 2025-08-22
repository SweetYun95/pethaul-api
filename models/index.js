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
const petImage = require('./petImage')
const Like =require('./like')
const Content = require('./content')

const db = {}
const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize

db.User = User
db.Item = Item
db.Cart = Cart
db.CartItem = CartItem
db.Category = Category
db.ItemCategory = ItemCategory
db.Order = Order
db.OrderItem = OrderItem
db.ItemImage = ItemImage
db.Review = Review
db.ReviewImage = ReviewImage
db.Pet = Pet
db.PetImage = PetImage
db.Domain = Domain
db.PetImage = PetImage
db.Like = Like
db.Content = Content


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
Domain.init(sequelize)
petImage.init(sequelize)
Like.init(sequelize)
Content.init(sequelize)

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
Domain.associate(db)
petImage.associate(db)
Like.associate(db)
Content.associate?.(db)

module.exports = db
