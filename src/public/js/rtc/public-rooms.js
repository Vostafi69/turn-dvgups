import Connection from "./Connection";

// Идентификатор публичных комнат
const PUBLIC_ROOM_IDENTIFIER = "list-public-rooms";

// Объект подключения
const connection = Connection.getInstance();

// Базовая настройки подключения
connection.publicRoomIdentifier = PUBLIC_ROOM_IDENTIFIER;
connection.socketMessageEvent = PUBLIC_ROOM_IDENTIFIER;

/**
 * Обновление списка публичных комнат в таблице.
 * @param {Array} rooms - Массив объектов комнат.
 * @returns {void}
 */
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

/**
 * Функция создает строку HTML таблицы для публичной комнаты.
 * @param {Object} room - Объект комнаты, содержащий информацию о комнате
 * @param {Number} id - Индекс комнаты
 * @returns {String} - Возвращает строку HTML, представляющую строку таблицы для комнаты
 */
function createRoomItem(room, id) {
  const tr = `<tr class="table__tr">
                <td class="table__cell">${++id}</td>
                <td class="table__cell">${room.extra.roomName}</td>
                <td class="table__cell">${room.participants.length}/${
    room.maxParticipantsAllowed
  }</td>
      <td class="table__cell">
        <button
          class="button ripple"
          id="button-join-room"
          data-ripple-color="light"
          role="button"
        >
            Присоединиться
          <div class="ripple__container"></div>
        </button>
      </td>
    </tr>`;

  return tr;
}

/**
 * Функция постоянно обновляет список публичных комнат и отправляет запрос на получение последнего списка комнат комнат каждые 3000ms.
 * @param {SocketIO.Socket} socket - Сокет для отправки запроса
 * @returns {void}
 */
function looper() {
  connection.socket.emit("get-public-rooms", PUBLIC_ROOM_IDENTIFIER, function (listOfRooms) {
    updateListOfRooms(listOfRooms);

    setTimeout(looper, 3000);
  });
}

/**
 * Присоединяет к сокету и запускает функцию looper
 * @param {SocketIO.Socket} socket - Состояние сокета для присоединения
 * @returns {void}
 */
connection.connectSocket(function (socket) {
  looper();

  socket.on("disconnect", function () {
    location.reload();
  });
});
