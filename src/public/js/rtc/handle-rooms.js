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
connection.dontCaptureUserMedia = true;

// password
const passwordInput = document.querySelector(".input-password");
const hasPassword = document.querySelector(".checkbox-has-password");
const paswordFormItem = passwordInput ? passwordInput.closest(".form__item") : undefined;
const publicNameInput = document.querySelector(".input-name");
const isPrivate = document.querySelector(".checkbox-is-private");

export function init() {
  handleErrors();
  handlePassword();
  openRoom();
  joinRoom();
}

function handlePassword() {
  if (!passwordInput || !hasPassword || !paswordFormItem) return;

  hasPassword.addEventListener("change", (e) => {
    e.target.checked
      ? paswordFormItem.classList.remove("form__item--hidden")
      : paswordFormItem.classList.add("form__item--hidden");
  });
}

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
function openRoom() {
  const openRoomButton = document.querySelector(".button-open-room");

  if (!openRoomButton) return;

  openRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const roomid = uuidv4();

    const refObject = {
      id: roomid,
      event: "open",
    };

    if (publicNameInput.value === "") {
      Toastify({
        text: "Название является обязательным",
        gravity: "top",
        position: "center",
        className: "toast toast--destructive",
      }).showToast();

      publicNameInput.focus();

      return;
    }

    if (hasPassword.checked && passwordInput.value === "") {
      Toastify({
        text: "Не задан пароль для комнаты",
        gravity: "top",
        position: "center",
        className: "toast toast--destructive",
      }).showToast();

      return;
    }

    if (hasPassword.checked) {
      refObject["password"] = passwordInput.value.trim();
    }

    if (publicNameInput.value !== "") {
      refObject["public-name"] = publicNameInput.value.trim();
    }

    if (isPrivate.checked) {
      refObject["is-private"] = "true";
    }

    openRoomButton.innerHTML = '<div class="loader-small"></div>';
    openRoomButton.disabled = true;

    connection.checkPresence(roomid, function (isRoomExist) {
      if (isRoomExist) {
        Toastify({
          text: "Не удалось создать комнату, так как она уже существует",
          gravity: "top",
          position: "center",
          className: "toast toast--destructive",
        }).showToast();

        return;
      }

      if (!isRoomExist) {
        const origin = window.location.origin;
        const href = CreateURL.addParams(origin + "/conf/room", refObject);

        window.open(href, "_self");
      }
    });

    setTimeout(() => {
      openRoomButton.innerHTML = "Создать";
      openRoomButton.disabled = false;
    }, 500);
  });
}

/**
 * Присоединяет к комнате
 * @function joinRoom
 * @returns {void}
 */
function joinRoom() {
  const joinRoomButton = document.getElementById("button-join-room");

  if (!joinRoomButton) return;

  joinRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const roomid = document.querySelector(".input-join-string").value.trim();

    if (roomid === "") {
      Toastify({
        text: "Строка подключения пустая",
        gravity: "top",
        position: "center",
        className: "toast toast--destructive",
      }).showToast();

      return;
    }

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

      if (error) {
        Toastify({
          text: "Произошла ошибка",
          gravity: "top",
          position: "center",
          className: "toast toast--destructive",
        }).showToast();

        console.log(error);

        return;
      }

      if (isRoomExist) {
        const origin = window.location.origin;
        const href = CreateURL.addParams(origin + "/conf/room", {
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
  });
}
