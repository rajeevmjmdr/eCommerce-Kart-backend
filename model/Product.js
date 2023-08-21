const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: [0, "Price too low"],
    required: true,
    default: 0,
  },
  discountPercentage: {
    type: Number,
    min: [0, "not Vaild discount"],
    max: [99, "Discount invalid"],
    default: 0,
  },
  rating: {
    type: Number,
    min: [0, "not Vaild rating"],
    max: [5, "rating invalid"],
    default: 0,
  },
  stock: {
    type: Number,
    min: [0, "not Vaild stock"],
    default: 0,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  images: { type: [String], required: true },
  deleted: { type: Boolean, default: false },
});

const virtual = productSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
productSchema.set('toJSON',{
    virtuals:true,
    versionKey:false,
    transform:function(doc,ret){delete ret._id}
})

exports.Product = mongoose.model("Product", productSchema);
