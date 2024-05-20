import connection from "./connection";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const btnJoinRoom = document.getElementById("button-join-room");
const inputJoinString = document.querySelector(".input-join-string");

function initJoinRoom() {
  if (!btnJoinRoom) return;

  btnJoinRoom.addEventListener("click", (e) => joinRoom(e));
}

function joinRoom(e) {
  e.preventDefault();

  const roomid = inputJoinString.value.trim();

  if (roomid === "") {
    Toastify({
      text: "Строка подключения пустая",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();

    return;
  }

  btnJoinRoom.innerHTML = '<div class="loader-small"></div>';
  btnJoinRoom.disabled = true;

  connection.checkPresence(roomid, (isRoomExist, roomid, error) =>
    handlePresence(isRoomExist, roomid, error)
  );
}

function handlePresence(isRoomExist, roomid) {
  if (!isRoomExist) {
    Toastify({
      text: "Такой комнаты не существует",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();

    setTimeout(() => {
      btnJoinRoom.innerHTML = "Подключиться";
      btnJoinRoom.disabled = false;
    }, 500);

    return;
  }

  if (isRoomExist) {
    window.location.replace(`/${roomid}?event=join`);
  }
}

initJoinRoom();
