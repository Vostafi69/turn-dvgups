import Connection from "./Connection";

const PUBLIC_ROOM_IDENTIFIER = "list-public-rooms";

const connection = Connection.getInstance();

connection.publicRoomIdentifier = PUBLIC_ROOM_IDENTIFIER;
connection.socketMessageEvent = PUBLIC_ROOM_IDENTIFIER;

function updateListOfRooms(rooms) {
  const publicRooms = document.querySelector(".table__body");

  if (!publicRooms) return;

  if (!rooms.length) {
    publicRooms.innerHTML = `<tr class="table__tr">
                              <td class="table__cell" colspan="4" style="text-align: center">
                                Нет активных конференций
                              </td>
                            </tr>`;
    return;
  }

  let template = "";

  rooms.forEach((room, id) => {
    template += createRoomItem(room, id);
  });

  publicRooms.innerHTML = template;
}

function createRoomItem(room, id) {
  const tr = `<tr class="table__tr">
                <td class="table__cell">${++id}</td>
                <td class="table__cell">${room.extra.roomName}</td>
                <td class="table__cell">${room.participants.length}/${
    room.maxParticipantsAllowed
  }</td>
                <td class="table__cell">
                  <button class="button ripple" data-ripple-color="light" role="button">
                    Присоединиться
                    <div class="ripple__container"></div>
                  </button>
                </td>
              </tr>`;

  return tr;
}

function looper() {
  connection.socket.emit("get-public-rooms", PUBLIC_ROOM_IDENTIFIER, function (listOfRooms) {
    updateListOfRooms(listOfRooms);

    setTimeout(looper, 3000);
  });
}

connection.connectSocket(function (socket) {
  looper();

  socket.on("disconnect", function () {
    location.reload();
  });
});
