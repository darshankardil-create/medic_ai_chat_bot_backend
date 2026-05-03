import express from "express";
import router from "./src/router.js";
import dotenv from "dotenv";
import cors from "cors";
import { socketconnection } from "./src/socket.js";
import { connectDB } from "./src/configdb.js";

dotenv.config();

socketconnection();

const app = express();

const port = process.env.PORT;

app.listen(port, () => {
  console.log("server is live on port", port);
});

app.use(
  cors({
    origins: ["*"],
  }),
);

app.use(express.json());

app.use("/",(req,res,next) => {
console.log("got",req.method,"req")
next()
})

connectDB().then(() => {



app.use("/", router);
})


