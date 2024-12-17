import mongoose from "mongoose";

export const connectMongoDB = async (URL) => {
  try {
    await mongoose.connect(URL);
    console.log("DATABASE CONNECTED");
  } catch (error) {
    console.error(`Error occurred while connecting MongoDB: ${error.message}`);
  }
};
