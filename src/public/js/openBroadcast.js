import connection from "./connection";
import { v4 as uuidv4 } from "uuid";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// ####################################################################
// Элементы страницы
// ####################################################################
const btnOpen = document.getElementById("button-open");
const inputConfName = document.getElementById("input-conf-name");
const inputPassword = document.getElementById("input-password");
const formPasswordItem = inputPassword.closest(".form__item");
const cbIsPrivate = document.getElementById("checkbox-is-private");
const cbHasPassword = document.getElementById("checkbox-has-password");

// ####################################################################
// Установка создания
// ####################################################################

cbHasPassword.addEventListener("change", () => {
  if (cbHasPassword.checked) {
    formPasswordItem.classList.remove("form__item--hidden");
    inputPassword.focus();
  } else {
    formPasswordItem.classList.add("form__item--hidden");
  }
});

function initOpenBroadCast() {
  if (!btnOpen) return;

  btnOpen.addEventListener("click", (e) => {
    e.preventDefault();

    startBroadcasting();
  });
}

function startBroadcasting() {
  const broadcastId = uuidv4();
  let confParams = "";
  const fieldsIsValide = validateOpenBroadcastFields();

  if (!fieldsIsValide) return;

  btnOpen.innerHTML = '<div class="loader-small"></div>';
  btnOpen.disabled = true;

  connection.getSocket((socket) => {
    socket.emit("check-broadcast-presence", broadcastId, (isBroadcastExists) => {
      if (isBroadcastExists) {
        Toastify({
          text: "Видеотрансляция с таким ID уже существует",
          gravity: "top",
          position: "center",
          className: "toast toast--destructive",
        }).showToast();

        setTimeout(() => {
          btnOpen.innerHTML = "Создать";
          btnOpen.disabled = false;
        }, 500);

        return;
      }

      if (cbIsPrivate.checked) confParams += "&is-private=true";
      if (cbHasPassword.checked) confParams += `&password=${inputPassword.value}`;
      if (inputConfName) confParams += `&conf-name=${inputConfName.value}`;

      window.location.replace(`/${broadcastId}?event=open${confParams}`);
    });
  });
}

function validateOpenBroadcastFields() {
  if (cbHasPassword.checked && inputPassword.value.trim() === "") {
    Toastify({
      text: "Пароль не может быть пустым",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();

    inputPassword.focus();
    return false;
  }

  if (inputConfName.value.trim() === "") {
    Toastify({
      text: "Название комнаты не может быть пустым",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();

    inputConfName.focus();
    return false;
  }

  return true;
}

initOpenBroadCast();
