import mongoose from "mongoose";

let dbInstance;
async function connectToDB() {
  const dbURL: string = process.env.DB_URI as string;
  const dbInstance = await mongoose.connect(dbURL);
  if (!dbInstance) {
    throw new Error("Unable to connect to DB!");
  } else {
    console.log("Connected to DB!");
  }
}

export { connectToDB, dbInstance };
