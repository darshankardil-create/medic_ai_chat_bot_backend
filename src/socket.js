import { handleuserquery } from "./mainfunction.js";

 export function socketconnection(io) {
  io.on("connection", (socket) => {
    console.log("user with id:", socket.id, "connected successfull via socket");
    //get history from user as parameter
    socket.on("proceedans", async (userq, history = null) => {
      if (history) {
        const answer = await handleuserquery(userq, history);
        socket.emit("getanswer", answer);
        return;
      }

      const answer = await handleuserquery(userq);
      socket.emit("getanswer", answer);
    });
  });
}
