const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const productSchema = new Schema({
    tag: {
        type: String,
        required: true,
    },

    supermarket: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    }

});

productSchema.index({ tag: 1, supermarket: 1}, { unique: true });


const Product = model("Product", productSchema);

module.exports = Product;