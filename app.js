import express from "express";
import router from "./src/router.js";
import dotenv from "dotenv";
import cors from "cors";
import { socketconnection } from "./src/socket.js";
import { connectDB } from "./src/configdb.js";
import { Server } from "socket.io";
import http from "http";
import { ratelimiter } from "./src/ratelimit.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/", (req, res, next) => {
  console.log("got", req.method, "req");

  next();
});

app.use(
  cors({
    origins: ["https://medicaichatbotfrontend.vercel.app"],
  }),
);

connectDB().then(() => {
  app.set("trust proxy", 1);

  app.use("/", ratelimiter, router);
});

const httpserver = http.createServer(app);

const port = process.env.PORT;

httpserver.listen(port, () => {
  console.log("server is live on port:", port);
});

const io = new Server(httpserver, {
  cors: ["https://medicaichatbotfrontend.vercel.app"],
});

socketconnection(io);
