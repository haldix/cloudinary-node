// INDEX.JS
const express = require('express');
require('dotenv').config();
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const Image = require('./model');

const app = express();

// Connect database
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'demo',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }]
});

const parser = multer({ storage: storage });

// Render Input Form
app.get('/', (req, res) => {
  res.send(
    ` <form action='/uploads' method='post' enctype='multipart/form-data'>
      <input type='file' name='image' />
      <input type='submit' value="Submit" />
    </form>`
  );
});

// Upload image to Cloudinary & Save url to MongoDB
app.post('/uploads', parser.single('image'), (req, res) => {
  console.log(req.file); // to see what is returned to you
  const { url, public_id, originalname } = req.file;

  Image.create({ url, public_id, originalname }) // save image information in database
    .then(newImage => {
      res.send(`<h1>Image Saved</h1>
      <img src=${newImage.url} />`);
    })
    .catch(err => console.log(err));
});

// Delete image from Cloudinary & MongoDB
app.get('/remove', (req, res) => {
  // hard-coded id, doc could be part of larger related collection
  const public_id = 'demo/a3akswzwu3kxe2ujkn3z';
  cloudinary.uploader.destroy(public_id, { invalidate: true }, (err, res) => {
    if (err) {
      return console.log(err);
    } else {
      console.log(res);
    }
  });
  Image.deleteOne({ public_id })
    .then(img => {
      console.log('Cloud image Removed', img);
    })
    .catch(err => console.log(err));
  res.end();
});

app.listen(3000, () => console.log('Server on Port 3000'));
