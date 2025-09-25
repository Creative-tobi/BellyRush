const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_BB_URL = process.env.compass;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_BB_URL);
    console.log(`mongobd connected${MONGO_BB_URL}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
