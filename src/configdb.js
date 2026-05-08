import mongoose from "mongoose";


export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODBURL);
    console.log("successfully connected to db");
  } catch (error) {
    console.log(error);
    console.log("Failed to connect mongodb");
    process.exit(1);
  }
}
