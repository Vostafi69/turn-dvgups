import Connection from "./Connection";
import { ICE_SERVERS, SOCKET_URL } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";
import CreateURL from "../helpers/CreateURL";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// Объект подключения
const connection = Connection.getInstance();

// Базовые настройки подключения
connection.socketURL = SOCKET_URL;
connection.iceServers = [{ urls: ICE_SERVERS }];
connection.autoCreateMediaElement = false;
connection.dontCaptureUserMedia = true;

/**
 * Обрабатывает ошибки и уведомления из URL параметров.
 * @function handleErrors
 * @returns {void}
 */
function handleErrors() {
  const params = new URLSearchParams(document.location.search);

  const error = params.get("error");
  const alert = params.get("alert");

  if (error) {
    Toastify({
      text: "Не удалось установить соединение",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
      duration: 5000,
      close: true,
    }).showToast();
  }

  if (alert) {
    Toastify({
      text: alert,
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
      duration: 5000,
      close: true,
    }).showToast();
  }
}

/**
 * Открывает новую комнату
 * @function openRoom
 * @returns {void}
 */
export function openRoom() {
  const openRoomButton = document.querySelector(".button-open-room");

  if (!openRoomButton) return;

  openRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const publicNameInput = document.querySelector(".input-name");
    const isPrivate = document.querySelector(".checkbox-is-private").checked;

    const roomid = uuidv4();

    const refObject = {
      id: roomid,
      event: "open",
    };

    if (!isPrivate) {
      if (publicNameInput.value === "") {
        Toastify({
          text: "Для открытой комнаты название является обязательным",
          gravity: "top",
          position: "right",
          className: "toast toast--destructive",
        }).showToast();

        publicNameInput.focus();

        return;
      }
    }

    if (publicNameInput.value !== "") {
      refObject["public-name"] = publicNameInput.value.trim();
    }

    const href = CreateURL.addParams("https://localhost/conf/room", refObject);

    window.open(href, "_self");
  });
}

/**
 * Присоединяет к комнате
 * @function joinRoom
 * @returns {void}
 */
export function joinRoom() {
  const joinRoomButton = document.getElementById("button-join-room");

  if (!joinRoomButton) return;

  joinRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const roomid = document.querySelector(".input-join-string").value.trim();

    if (roomid === "") {
      Toastify({
        text: "Строка подключения пустая",
        gravity: "top",
        position: "right",
        className: "toast toast--destructive",
      }).showToast();

      return;
    }

    const href = CreateURL.addParams("https://localhost/conf/room", {
      id: roomid,
      event: "join",
      userName: "Алексей",
    });

    window.open(href, "_self");
  });
}

handleErrors();
