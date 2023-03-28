const mongoose =require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters."],
      maxLength: [100, "First name is too large"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters."],
      maxLength: [100, "Last name is too large"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Provide your valid Email"],
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email address is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: (value) =>
          validator.isStrongPassword(value, {
            minLength: 6,
            minLowercase: 3,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1,
          }),
        message: "Password {VALUE} is not strong enough.",
      },
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords don't match!",
      },
    },      
 
    address: {
      type: String,
      trim: true,
    },   
    role: {
      type: String,
      enum: ["student","agent","admission-counselor","admin"],
      default: "student",
    },
    photo: {
      data: Buffer,
      contentType: String,     
    }, 
    phone: {
      type: String,
      default: "+880",
    },
    bio: {
      type: String,
      maxLength: [250, "Bio must not be more than 250 characters"],
      default: "bio",
    },
  },
  { timestamps: true,versionKey: false }
);

// virtual field
userSchema.virtual("fullName").
get(function() { return `${this.firstName} ${this.lastName}`; });

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    this.confirmPassword = undefined;
    //  only run if password is modified, otherwise it will change every time we save the user!
    return next();
  }
  const password = this.password;
  const confirmPassword=this.confirmPassword

  const hashedPassword = bcrypt.hashSync(password);
  const hashedConfirmPassword = bcrypt.hashSync(confirmPassword);

  this.password = hashedPassword;
   this.confirmPassword = undefined;
  // this.confirmPassword = hashedConfirmPassword;

  next();
});

userSchema.methods.comparePassword = function (password, hash) {
  const isPasswordValid = bcrypt.compareSync(password, hash);
  return isPasswordValid;
};

userSchema.methods.generateConfirmationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.confirmationToken = token;

  const date = new Date();

  date.setDate(date.getDate() + 7);
  this.confirmationTokenExpires = date;

  return token;
};

module.exports= mongoose.model("User", userSchema);
