import connection from "./connection";
import { PUBLIC_ROOM_ID } from "./utils/constants";

connection.connectSocket((socket) => {
  looper();

  socket.on("disconnect", () => {
    location.reload();
  });
});

function looper() {
  connection.socket.emit("get-public-rooms", PUBLIC_ROOM_ID, (listOfRooms) => {
    console.log(listOfRooms);

    setTimeout(looper, 3000);
  });
}
