const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  public_id: {
    type: String,
    required: true,
    unique: true
  },
  originalname: String
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
