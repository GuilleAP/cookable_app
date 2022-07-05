const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required.'],
      unique: true
    },

    email: {
      type: String,
      uniquie: true,
      required: [true, 'Email is required.']
    },

    password: {
      type: String,
      required: [true, 'Password is required.']
    },

    ingredients: { 
      type: [String] 
    },

    recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }]

  });

const User = model("User", userSchema);

module.exports = User;
