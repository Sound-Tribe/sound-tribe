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
      enum: ['tribe', 'tan'],
      required: [true, 'You must choose between Band or Fan.']
    },
    interests: {
      type: [String],
      required: [true, 'Interests are required.']
    },
    picture: {
      type: String,
      default: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa.1stdibscdn.com%2Fvintage-tikar-tribal-mask-cameroon-african-tropical-hardwood-circa-1970-for-sale-picture-2%2Ff_26453%2F1592499575827%2F18_6567_2_master.jpg%3Fwidth%3D768&f=1&nofb=1&ipt=406dbf22f93a3a86f5751e0771a357f58c4ecf7d63e39043810d0109b3a4211a&ipo=images'
    },
    city: String,
    country: String,
    socialMedia: [String]
  },
  {
    timestamps: true
  }
);
 
const User = model('User', userSchema);

module.exports = User;