// models/content.js
module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    title:      { type: DataTypes.STRING(200), allowNull: false },
    summary:    { type: DataTypes.STRING(500), allowNull: false },
    body:       { type: DataTypes.TEXT, allowNull: true },
    tag:        { type: DataTypes.STRING(50), allowNull: true }, // GUIDE/TREND/ETC
    author:     { type: DataTypes.STRING(50), allowNull: true },
    coverUrl:   { type: DataTypes.STRING(500), allowNull: true },
    thumbUrl:   { type: DataTypes.STRING(500), allowNull: true },
    isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status:     { type: DataTypes.ENUM('draft','published'), allowNull: false, defaultValue: 'published' },
    publishedAt:{ type: DataTypes.DATE, allowNull: true },
    slug:       { type: DataTypes.STRING(200), allowNull: true, unique: true },
  }, {
    tableName: 'contents',
    timestamps: true,
  })

  return Content
}

