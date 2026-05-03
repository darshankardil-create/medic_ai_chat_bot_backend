import { Server } from "socket.io";
import http from "http";
import { handleuserquery } from "./mainfunction.js";

export function socketconnection(app) {
  const httpserver = http.createServer(app);

  const port = process.env.SOCKETPORT;

  httpserver.listen(port, () => {
    console.log("socket server is live on port:", port);
  });

  const io = new Server(httpserver, {
    cors: ["*"],
  });

  io.on("connection", (socket) => {
    console.log("user with id:", socket.id, "connected successfull via socket");

    socket.on("proceedans", async (userq) => {
      const answer = await handleuserquery(userq);
      socket.emit("getanswer", answer);
    });
  });
}
