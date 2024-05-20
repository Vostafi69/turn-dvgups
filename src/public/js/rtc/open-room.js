import { v4 as uuidv4 } from "uuid";
import connection from "./connection";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const btnOpenRoom = document.querySelector(".button-open-room");
const passwordInput = document.querySelector(".input-password");
const hasPassword = document.querySelector(".checkbox-has-password");
const paswordFormItem = passwordInput ? passwordInput.closest(".form__item") : undefined;
const publicNameInput = document.querySelector(".input-name");
const isPrivate = document.querySelector(".checkbox-is-private");
const isLecture = document.querySelector(".checkbox-lecture");

function initOpenRoom() {
  if (!btnOpenRoom) return;

  btnOpenRoom.addEventListener("click", (e) => openRoom(e));
  handlePassToggle();
}

function handlePassToggle() {
  if (!passwordInput || !hasPassword || !paswordFormItem) return;

  hasPassword.addEventListener("change", (e) => {
    e.target.checked
      ? paswordFormItem.classList.remove("form__item--hidden")
      : paswordFormItem.classList.add("form__item--hidden");
  });
}

function openRoom(e) {
  e.preventDefault();

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

  let roomParams = `?public-name=${publicNameInput.value.trim()}`;
  if (hasPassword.checked) roomParams += `&password=${passwordInput.value.trim()}`;
  if (isPrivate.checked) roomParams += `&is-private=true`;
  if (isLecture.checked) roomParams += `&is-lecture=true`;

  btnOpenRoom.innerHTML = '<div class="loader-small"></div>';
  btnOpenRoom.disabled = true;

  const roomid = uuidv4();

  connection.checkPresence(roomid, (isRoomExist, roomid, error) =>
    handlePresence(isRoomExist, roomid, error)
  );
}

function handlePresence(isRoomExist, roomid) {
  if (isRoomExist) {
    Toastify({
      text: "Не удалось создать комнату, так как она уже существует",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();

    setTimeout(() => {
      btnOpenRoom.innerHTML = "Создать";
      btnOpenRoom.disabled = false;
    }, 500);

    return;
  }

  if (!isRoomExist) {
    window.location.replace(`/${roomid}?event=open`);
  }
}

initOpenRoom();
