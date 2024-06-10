const db = require("./database");
const favoriteSchema = db.mongoose.Schema({
    userId: {type: db.mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    productId: {type: db.mongoose.Schema.Types.ObjectId, ref: 'product', required: true},
    is_favorite: {type: Boolean, required: true},
}, {
    collection: "Favorite"
});
const modelFavorite = db.mongoose.model("favorite", favoriteSchema);
module.exports = {modelFavorite};