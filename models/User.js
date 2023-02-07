const { Schema, model } = require('mongoose');
 
const userSchema = new Schema(
  // Add whichever fields you need for your app
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username is required.'],
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: [true, 'Password is required.']
    },
    type: {
      type: String,
      enum: ['tribe', 'fan'],
      required: [true, 'You must choose between Band or Fan.']
    },
    interests: {
      type: [String],
      required: [true, 'Interests are required.']
    },
    picture: {
      type: String,
      default: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdiscoverafricanart.com%2Fwp-content%2Fuploads%2F2017%2F07%2FDAA-Houzz-profile.jpg&f=1&nofb=1&ipt=219a451070beec9677f6682221d5f467ed36dd8c119b74e1a27cd945347e6999&ipo=images'
    },
    city: String,
    country: String,
    spotifyLink: String,
    instagramLink: String
  },
  {
    timestamps: true
  }
);
 
const User = model('User', userSchema);

module.exports = User;