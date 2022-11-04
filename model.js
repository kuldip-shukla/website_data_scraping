const mongoose = require('mongoose');
const schema = mongoose.Schema;

var productsSchema = new schema({
    productName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('products', productsSchema);