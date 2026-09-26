const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    minLength: [3, "First name must be at least 3 characters long"],
    maxLength: [20, "First name is longer than the maximum allowed length (20)"]
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    minLength: [2, "Last name must be at least 3 characters long"],
    maxLength: [20, "Last name is longer than the maximum allowed length (20)"]
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Email is required"],
    maxLength: [50, "Email is longer than the maximum allowed length (50)"],
    validate: [
      {
        validator: (email) => (email.includes("@")),
        message: "Email should contain '@'"
      },
      {
        validator: (email) => (email.includes(".com")),
        message: "Email should contain '.com'"
      }
    ]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  age: {
    type: Number,
    min: [18, "You must be at least 18 years old"]
  },
  gender: {
    type: String,
    lowercase: true,
    enum: {
      values: ["male", "female", "other"],
      message: "'{VALUE}' is not a valid gender"
    }
  },
  companyName: {
    type: String
  },
  designation: {
    type: String
  },
  skills: {
    type: Array,
  },
  photoUrl: {
    type: String,
    default: "https://t4.ftcdn.net/jpg/11/68/50/57/360_F_1168505794_IBCEiafsIrHFJ09e65P2vh5115C1XI7e.jpg"
  },
  about: {
    type: String,
    default: "Just getting started here!"
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  dateUpdated: {
    type: Date
  },
  status: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
  }
});

// Schema middleware
userSchema.pre("save", function () {
  if (!this.isNew) {
    this.dateUpdated = new Date(Date.now())
  }
})


// Schema Methods
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordEnteredByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordEnteredByUser,
    passwordHash,
  );

  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
