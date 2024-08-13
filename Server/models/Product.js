const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id:{
    type: Number,
  },
  title: {
   type: String,
  },
  price:{
    type: Number, 
  },
  description: {
    type: String,
  },
  category: {
    type : String,
  },
  image: {
    type: String,
  },
  rating: {
    rate: Number,
    count: Number
  },
  dateOfSale: {
    type: Date
  },
  sold: {
    type: Boolean
  }, // Field to indicate if the product is sold
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
