const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const recipeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    ingredients: {
        type: [String]
    },

    url: {
        type: String
    },

    imageURL: {
        type: String
    },

    steps: {
        type: [String]
    },
    fromAPI: {
        type: Boolean,
        default: false
    }

});

const Recipe = model("Recipe", recipeSchema);

module.exports = Recipe;