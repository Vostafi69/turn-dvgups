import Connection from "./Connection";
import { SOCKET_URL, ICE_SERVERS, PUBLIC_ROOM_ID } from "../utils/constants";
import { toggleChat } from "./handlers";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

// Объект подключения
const connection = Connection.getInstance();

// settings
connection.socketURL = SOCKET_URL;
connection.maxParticipantsAllowed = 150;
connection.session = { audio: true, video: true, data: true };
connection.sdpConstraints.mandatory = { OfferToReceiveAudio: true, OfferToReceiveVideo: true };
connection.iceServers = [{ urls: ICE_SERVERS }];
connection.autoCreateMediaElement = true;
connection.videosContainer = document.querySelector(".videos-container");
connection.dontCaptureUserMedia = false;
connection.autoCloseEntireSession = true;
connection.chunkSize = 16000;
connection.enableFileSharing = false;
connection.autoSaveToDisk = false;
connection.codecs = { video: "H264", audio: "G722" };

// Получение лоудера
const loader = document.querySelector(".loader");

/**
 * Обработчик входящих сообщений.
 * @param {Object} event - Объект, содержащий данные о сообщении.
 * @returns {void}
 */
connection.onmessage = function (event) {
  if (event.data.event) {
    window.location.replace("/");
    return;
  }

  if (event.data.message) {
    showMessage(event);
    return;
  }
};

/**
 * Инициализирует комнату, разбирая параметры URL и устанавливает необходимые функции.
 * @function initRoom
 * @returns {void}
 */
export function initRoom() {
  const params = new URLSearchParams(document.location.search);

  const roomid = params.get("id");
  const eventType = params.get("event");
  const publicName = params.get("public-name");
  const userName = params.get("userName");

  if (!!publicName) {
    connection.publicRoomIdentifier = PUBLIC_ROOM_ID;
    connection.extra.roomName = publicName;
  }

  if (!!userName) {
    connection.extra.userName = userName;
  }

  if (!roomid) return;

  checkUserHasRTC(() => {
    if (eventType === "open") {
      connection.open(roomid, (isOpened, _roomid, error) => {
        if (isOpened) {
          loader.remove();
          alert(connection.sessionid);
        }

        if (error) {
          window.location.replace(`/conf/create-conf?error=${error}`);
        }
      });
    } else {
      connection.join(roomid, (isJoined, _roomid, error) => {
        if (isJoined) {
          loader.remove();
        }

        if (error) {
          window.location.replace(`/conf/join-conf?error=${error}`);
        }
      });
    }

    setTooltips();
    toggleMicro();
    toggleCamera();
    membersHandler();
    sendMessage();
    toggleChat();
    leave();
  });
}

/**
 * Устанавливает тултипы для кнопок
 * @function setTooltips
 * @returns {void}
 */
function setTooltips() {
  tippy("#btn-leave", {
    content: "Покинуть",
  });
  tippy("#btn-chat", {
    content: "Чат",
  });
  tippy("#btn-toggle-video", {
    content: "Видео",
  });
  tippy("#btn-admin", {
    content: "Настройки",
  });
  tippy("#btn-toggle-sound", {
    content: "Звук",
  });
  tippy("#btn-toggle-microphone", {
    content: "Микрофон",
  });
  tippy("#btn-screen-share", {
    content: "Показ экрана",
  });
  tippy("#btn-members", {
    content: "Участники",
  });
  tippy("#btn-hand-up", {
    content: "Поднять руку",
  });
}

/**
 * Обработчик события присоединения пользователя
 * @param {Object} event - Содержит информацию о пользователе
 * @returns {void}
 */
connection.onopen = function (event) {
  connection.onUserStatusChanged(event);

  Toastify({
    text: `${event.extra.userName} присоединился`,
    gravity: "top",
    position: "left",
    className: "toast toast--alert",
  }).showToast();
};

connection.onerror = connection.onclose = function (event) {
  connection.onUserStatusChanged(event);
};

connection.onleave = function (event) {
  Toastify({
    text: `${event.extra.userName} покинул конференцию`,
    gravity: "top",
    position: "left",
    className: "toast toast--alert",
  }).showToast();
};

/**
 * Проверяет наличие необходимых разрешений и возможностей для звука и видео
 * @param {Function} cb - Коллбэк, выполняемый при успешной проверке
 * @returns {void}
 */
function checkUserHasRTC(cb) {
  connection.DetectRTC.load(function () {
    if (
      !connection.DetectRTC.hasMicrophone ||
      !connection.DetectRTC.isWebsiteHasMicrophonePermissions
    ) {
      connection.session.audio = false;
      connection.mediaConstraints.audio = false;
    }

    if (!connection.DetectRTC.hasWebcam || !connection.DetectRTC.isWebsiteHasWebcamPermissions) {
      connection.session.video = false;
      connection.mediaConstraints.video = false;
    }

    cb();
  });
}

function leave() {
  const leaveButton = document.getElementById("btn-leave");

  if (!leaveButton) return;

  leaveButton.addEventListener("click", () => {
    if (connection.isInitiator) {
      connection.send({ event: "close-entire-room" });
    } else {
      connection.closeSocket();
    }

    window.location.replace("/");
  });
}

function toggleMicro() {
  const toggleMicroButton = document.querySelector(".btn-toggle-microphone");

  if (!toggleMicroButton) return;

  toggleMicroButton.addEventListener("click", (_e) => {
    const audioTrack = connection.attachStreams[0]
      .getTracks()
      .find((track) => track.kind === "audio");
    connection.attachStreams[0].removeTrack(audioTrack);
  });
}

function toggleCamera() {
  const toggleCameraButton = document.querySelector(".btn-toggle-video");
  if (!toggleCameraButton) return;
  toggleCameraButton.addEventListener("click", (_e) => {
    const videoTrack = connection.attachStreams[0]
      .getTracks()
      .find((track) => track.kind === "video");
    connection.attachStreams[0].removeTrack(videoTrack);
  });
}

function sendMessage() {
  const chatInput = document.querySelector(".chat__input");
  const sendButton = document.querySelector(".chat__button");

  if (!chatInput || !sendButton) return;

  sendButton.addEventListener("click", (e) => {
    e.preventDefault();
    const message = chatInput.value.replace(/^\s+|\s+$/g, "");

    if (!message) return;

    chatInput.value = "";
    showMessage(message);
    connection.send({
      message: message,
    });
  });
}

function showMessage(event) {
  const messagesContainer = document.querySelector(".chat__messages-container");

  if (!messagesContainer) return;

  const curretnDate = new Date();
  const messageEl = document.createElement("div");

  messageEl.innerHTML = ` 
    <div class="message__meta">
      <div class="message__autor">${event.userid || "Я"}</div>
      <div class="message__time">${curretnDate.getHours()}:${curretnDate.getMinutes()}</div>
      <div class="message__settings" role="button">...</div>
    </div>
    <p class="message__content">${event.data?.message || event}</p>
  `;

  messageEl.classList.add("message");
  messagesContainer.appendChild(messageEl);
}

function toggleScreen() {}

function handdUp() {}

function membersHandler() {
  const membersCount = document.querySelector(".members-count");
  if (!membersCount) return;

  connection.onUserStatusChanged = function (_event) {
    const allMembers = connection.getAllParticipants();
    membersCount.textContent = allMembers.length + 1;
  };
}
