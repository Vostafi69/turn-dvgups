import connection from "./connection";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// ####################################################################
// Элементы страницы
// ####################################################################

const inputJoinString = document.getElementById("input-join-string");
const btnJoin = document.getElementById("button-join");

// ######################### патерн валидации #########################

const validatePattern =
  /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/;

// ####################################################################
// Установка подключения
// ####################################################################

function initJoinRoom() {
  if (!btnJoin) return;

  btnJoin.addEventListener("click", (e) => {
    e.preventDefault();

    joinBroadcast();
  });
}

function joinBroadcast() {
  const isValideJoinString = validateJoinString();
  const broadcastId = inputJoinString.value;

  if (!isValideJoinString) return;

  btnJoin.innerHTML = '<div class="loader-small"></div>';
  btnJoin.disabled = true;

  connection.getSocket((socket) => {
    socket.emit("check-broadcast-presence", broadcastId, (isBroadcastExists) => {
      if (!isBroadcastExists) {
        Toastify({
          text: "Такой видеотрансляции не существует",
          gravity: "top",
          position: "center",
          className: "toast toast--destructive",
        }).showToast();

        setTimeout(() => {
          btnJoin.innerHTML = "Подключиться";
          btnJoin.disabled = false;
        }, 500);
        return;
      }

      window.location.replace(`/${broadcastId}?event=join&user-name=Guest`);
    });
  });
}

function validateJoinString() {
  if (!validatePattern.test(inputJoinString.value)) {
    Toastify({
      text: "Такой строки подключения не может быть",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();

    inputJoinString.focus();

    return false;
  }

  return true;
}

initJoinRoom();
