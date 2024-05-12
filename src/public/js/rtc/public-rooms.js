import Connection from "./Connection";
import { PUBLIC_ROOM_ID } from "../utils/constants";
import CreateURL from "../helpers/CreateURL";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// Объект подключения
const connection = Connection.getInstance();

// Базовая настройки подключения
connection.publicRoomIdentifier = PUBLIC_ROOM_ID;
connection.socketMessageEvent = PUBLIC_ROOM_ID;

(function init() {
  connection.connectSocket(function (socket) {
    looper();

    socket.on("disconnect", function () {
      location.reload();
    });
  });
})();

/**
 * Обновление списка публичных комнат в таблице.
 * @param {Array} rooms - Массив объектов комнат.
 * @returns {void}
 */
function _updateListOfRooms(rooms) {
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

  publicRooms.innerHTML = "";

  rooms.forEach((room, id) => {
    const publicRoom = createRoomItem(room, id);
    publicRooms.appendChild(publicRoom);
  });
}

/**
 * Функция создает строку HTML таблицы для публичной комнаты.
 * @param {Object} room - Объект комнаты, содержащий информацию о комнате
 * @param {Number} id - Индекс комнаты
 * @returns {String} - Возвращает строку HTML, представляющую строку таблицы для комнаты
 */
function createRoomItem(room, id) {
  const TR = document.createElement("tr");
  TR.classList.add("table__tr");
  const html = `<td class="table__cell">${++id}</td>
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
      </td>`;

  TR.innerHTML = html;

  const joinButton = TR.querySelector("#button-join-room");
  joinButton.addEventListener("click", (event) => {
    event.preventDefault();

    joinPublicRoom.call(event.target.closest("button"), room.sessionid);
  });

  return TR;
}

function joinPublicRoom(roomid) {
  const joinRoomButton = this;
  joinRoomButton.innerHTML = '<div class="loader-small"></div>';
  joinRoomButton.disabled = true;

  connection.checkPresence(roomid, function (isRoomExist, _, error) {
    if (!isRoomExist) {
      Toastify({
        text: "Такой комнаты не существует",
        gravity: "top",
        position: "center",
        className: "toast toast--destructive",
      }).showToast();

      return;
    }

    if (isRoomExist) {
      const href = CreateURL.addParams("https://localhost/conf/room", {
        id: roomid,
        event: "join",
        userName: "Алексей",
      });

      window.open(href, "_self");
    }
  });

  setTimeout(() => {
    joinRoomButton.innerHTML = "Подключиться";
    joinRoomButton.disabled = false;
  }, 500);
}

/**
 * Функция постоянно обновляет список публичных комнат и отправляет запрос на получение последнего списка комнат комнат каждые 3000ms.
 * @param {SocketIO.Socket} socket - Сокет для отправки запроса
 * @returns {void}
 */
function looper() {
  connection.socket.emit("get-public-rooms", PUBLIC_ROOM_ID, function (listOfRooms) {
    _updateListOfRooms(listOfRooms);

    setTimeout(looper, 3000);
  });
}
