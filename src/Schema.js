import mongoose from "mongoose";
import { type } from "os";
import bcrypt from "bcrypt";

const dataSchema = new mongoose.Schema({
  vector: [Number],
  text: String,
});

export const maindatasrccollec = mongoose.model("maindatachunks", dataSchema);

const auth = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
  chathistory: Array,
});

auth.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
  }
});

auth.methods.comparepass = async function (loginpass) {
  const bool = await bcrypt.compare(loginpass, this.password);
  return bool;
};

export const authmodel = mongoose.model("userinfo", auth);
