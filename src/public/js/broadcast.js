import "../libs/FileBufferReader.min";
import connection from "./connection";
import { PUBLIC_ROOM_ID } from "./utils/constants";
import ripple from "./modules/ripple";
import { Modal } from "../libs/mdb/mdb.es.min";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import Toastify from "toastify-js";
import ion from "./sounds";
import "toastify-js/src/toastify.css";
import ClipboardJS from "clipboard";
import {
  btnChat,
  btnChatclose,
  btnCopy,
  btnHandUp,
  btnInfo,
  btnInfoClose,
  btnLeave,
  btnMembers,
  btnMembersClose,
  btnScreenShare,
  btnSendMessage,
  btnShareLinkClose,
  btnToggleMicrophone,
  btnToggleShareModal,
  btnToggleVideo,
  cbAllcanSendMessages,
  chat,
  chatSwitch,
  form,
  grid,
  info,
  inputChat,
  loader,
  lobby,
  members,
  membersList,
  messagesContainer,
  panels,
  shareLinkModal,
  wrapper,
  adminVideo,
  btnSelectFile,
  fileContainer,
  permissionModal,
  btnPermissionModalCancel,
  btnsClose,
  chatForm,
  chatIsBlocked,
  participantsGrid,
  gridVideoCover,
  participants,
} from "./elements";
import { throttle } from "lodash";
import { Grid, GridItem } from "./viewersGirid";

// ####################################################################
// Константы
// ####################################################################

const LOADER_TIMEOUT = 500;
const TOOLTIP_TIMEOUT = 1000;
const PLAY_SOUND_TIMEOUT = 2500;

// processes

let selectedFile = null;

let VIEWERS_COUNT = 0;

const permissionModalInstance = new Modal(permissionModal);
const trottleSoundPlay = throttle(ion.sound.play, PLAY_SOUND_TIMEOUT);

const viewersGrid = new Grid(participantsGrid);

// ####################################################################
// Управленеи присоединением | созданием видеотрансляции
// ####################################################################

/**
 * Инициализирует Tooltips для кнопок страницы
 *
 * @returns {void}
 */
function initToolTips() {
  tippy(btnLeave, {
    content: "Покинуть",
  });
  tippy(btnChat, {
    content: "Чат",
  });
  tippy(btnToggleVideo, {
    content: "Видео",
  });
  tippy(btnToggleMicrophone, {
    content: "Микрофон",
  });
  tippy(btnScreenShare, {
    content: "Показ экрана",
  });
  tippy(btnMembers, {
    content: "Участники",
  });
  tippy(btnHandUp, {
    content: "Поднять руку",
  });
  tippy(btnToggleShareModal, {
    content: "Как присоединиться",
  });
  tippy(btnSendMessage, {
    content: "Отправить",
  });
  tippy(btnInfo, {
    content: "О конференции",
  });
  if (cbAllcanSendMessages.checked) {
    tippy(chatSwitch, {
      content: "Все могут отправлять сообщения",
    });
  } else {
    tippy(chatSwitch, {
      content: "Отправка сообщений ограничена",
    });
  }
  tippy(btnSelectFile, {
    content: "Прикрепить файл",
  });
  btnsClose.forEach((btnClose) => {
    tippy(btnClose, {
      content: "Закрыть",
    });
  });
}

function initBroadcast() {
  const broadcastId = getBroadcastId();
  const params = new URLSearchParams(document.location.search);

  const event = params.get("event");
  const userName = params.get("user-name");
  const confName = params.get("conf-name");
  const isPrivate = params.get("is-private");

  initToolTips();

  connection.publicRoomIdentifier = PUBLIC_ROOM_ID;

  connection.extra.confName = confName || "Видеоконференция";
  connection.extra.userName = userName || "Студент";
  connection.extra.chatPermission = true;

  if (event === "open") {
    initLobby(broadcastId);
  } else {
    cbAllcanSendMessages.disabled = true;
    connection.getSocket(function (socket) {
      socket.emit("check-broadcast-presence", broadcastId, (isBroadcastExists) => {
        if (!isBroadcastExists) {
          window.location.replace("/join");
        }

        socket.emit("join-broadcast", {
          broadcastId: broadcastId,
          userid: connection.userid,
          typeOfStreams: connection.session,
        });
      });
    });
  }

  window.history.pushState(null, "", window.location.pathname);
}

function getBroadcastId() {
  const broadcastId = window.location.pathname.slice(1);
  return broadcastId;
}

function initLobby(broadcastId) {
  ripple(lobby);
  wrapper.prepend(lobby);
  hideLoader();

  const btnContinues = document.getElementById("btn-continues");
  const btnBack = document.getElementById("btn-back");
  const videoPreview = document.getElementById("videoPreview");
  const cancelModal = document.getElementById("cancelModal");
  const btnCancelModal = document.getElementById("btn-modal-cancel");
  const lobbyBtnGroup = document.querySelector(".lobby__btn-group");
  const lobbyLoader = document.querySelector(".lobby__loader");

  btnBack.addEventListener("click", () => {
    const modal = new Modal(cancelModal);
    modal.show();
  });

  btnContinues.addEventListener("click", () => {
    connection.userid = broadcastId;
    connection.getSocket(function (socket) {
      btnContinues.disabled = true;
      btnContinues.innerHTML = '<div class="loader-small"></div><span style="margin-left: 0.5rem;">Создание...</span>';

      stopStreamedVideo(videoPreview);

      socket.emit("join-broadcast", {
        broadcastId: broadcastId,
        userid: connection.userid,
        typeOfStreams: connection.session,
      });
    });
  });

  btnCancelModal.addEventListener("click", () => {
    window.location.replace("/");
  });

  detectRTC(videoPreview, lobbyBtnGroup, lobbyLoader);
}

function detectRTC(videoPreview, lobbyBtnGroup, lobbyLoader) {
  lobbyBtnGroup.style.display = "none";
  lobbyLoader.style.display = "block";

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      videoPreview.srcObject = stream;
      videoPreview.addEventListener("loadedmetadata", () => {
        videoPreview.play();
      });
    })
    .catch((error) => console.log(error))
    .finally(() => {
      setTimeout(() => {
        lobbyLoader.style.display = "none";
        lobbyBtnGroup.style.display = "flex";
      }, LOADER_TIMEOUT);
    });
}

function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;

  if (stream) {
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    videoElem.srcObject = null;
  }
}

function initClipBoard() {
  btnShareLinkClose.addEventListener("click", () => {
    shareLinkModal.classList.add("share-link-modal--hiden");
  });

  const clipboard = new ClipboardJS(btnCopy);
  const instance = tippy(btnCopy);
  instance.disable();
  clipboard.on("success", (e) => {
    instance.enable();
    instance.setContent("Скопировано!");
    instance.show();

    setTimeout(() => {
      instance.hide();
      instance.disable();
    }, TOOLTIP_TIMEOUT);
    e.clearSelection();
  });
  clipboard.on("error", () => {
    instance.enable();
    instance.setContent("Не удалось скопировать!");
    instance.show();

    setTimeout(() => {
      instance.hide();
      instance.disable();
    }, TOOLTIP_TIMEOUT);
  });
}

function hideLoader() {
  setTimeout(() => {
    loader.style.display = "none";
  }, LOADER_TIMEOUT);
}

initBroadcast();

// ####################################################################
// Процесы видеотрансляции
// ####################################################################

function broadcasting() {
  if (!connection.isInitiator) {
    shareLinkModal.remove();
    btnToggleShareModal.remove();
    btnToggleMicrophone.remove();
    btnToggleVideo.remove();
    btnScreenShare.remove();
    btnInfo.remove();
  } else {
    initClipBoard();

    connection.addStream({
      audio: true,
      video: true,
      oneway: true,
    });

    btnToggleShareModal.addEventListener("click", () => {
      shareLinkModal.classList.toggle("share-link-modal--hiden");
    });

    mediaDevicesNotify();
  }

  renderMembersList();

  btnChat.addEventListener("click", toggleChat);
  btnMembers.addEventListener("click", toggleMembers);
  btnInfo.addEventListener("click", toggleInfo);
  btnSendMessage.addEventListener("click", sendMessage);
  form.addEventListener("keypress", (e) => e.keyCode === 13 && sendMessage(e));
  btnChatclose.addEventListener("click", hideAllPanels);
  btnMembersClose.addEventListener("click", hideAllPanels);
  btnInfoClose.addEventListener("click", hideAllPanels);
  cbAllcanSendMessages.addEventListener("change", handleMessagesPermissions);
  btnSelectFile.addEventListener("click", handleFileSelect);
  btnToggleVideo.addEventListener("click", toggleVideo);
  btnPermissionModalCancel.addEventListener("click", () => permissionModalInstance.hide());
  btnToggleMicrophone.addEventListener("click", toggleMicro);
  btnLeave.addEventListener("click", leaveHandler);
  btnHandUp.addEventListener("click", handleHandUp);
}

connection.connectSocket((socket) => {
  socket.on("logs", (log) => {
    console.log(log);
  });

  socket.on("start-broadcasting", (typeOfStreams) => {
    connection.sdpConstraints.mandatory = {
      OfferToReceiveVideo: false,
      OfferToReceiveAudio: false,
    };
    connection.session = typeOfStreams;

    connection.open(connection.userid, (isRoomOpened, _, error) => {
      if (error) {
        window.location.replace("/");
      }

      if (isRoomOpened) {
        broadcasting();
        setTimeout(() => {
          document.querySelector(".lobby")?.remove();
          ion.sound.play("add-peer");
        }, LOADER_TIMEOUT);
      }
    });
  });

  socket.on("join-broadcaster", function (hintsToJoinBroadcast) {
    connection.session = hintsToJoinBroadcast.typeOfStreams;
    connection.sdpConstraints.mandatory = {
      OfferToReceiveVideo: !!connection.session.video,
      OfferToReceiveAudio: !!connection.session.audio,
    };
    connection.broadcastId = hintsToJoinBroadcast.broadcastId;

    connection.join(hintsToJoinBroadcast.userid, (isJoined, _, error) => {
      if (error) {
        window.location.replace("/");
      }

      if (isJoined) {
        broadcasting();
        setTimeout(() => {
          hideLoader();
        }, LOADER_TIMEOUT);
      }
    });
  });
});

connection.onopen = function (event) {
  trottleSoundPlay("add-peer");

  renderMembersList(event);
};

connection.onmessage = function (event) {
  if (event.data.chatMessage) {
    trottleSoundPlay("message");
    appendMessage(event);
    return;
  }
};

connection.onNumberOfBroadcastViewersUpdated = function (event) {
  const viewers = event.viewers;
  const participants = [];
  const broadcastId = getBroadcastId();

  PREV_COUNT_USER = VIEWERS_COUNT;
  VIEWERS_COUNT = viewers.length - 1;

  if (VIEWERS_COUNT > 0) {
    gridVideoCover.style.background = "#3c4043";
    notifyAboutNewViewer();
  } else {
    gridVideoCover.style.background = "transparent";
  }

  viewers.forEach((viewerId) => {
    if (broadcastId === viewerId) return;

    participants.push(new GridItem(viewerId, "Алексей А.А.", "БО241ПИН"));
  });

  viewersGrid.update(participants);
};

connection.onstream = function (event) {
  adminVideo.srcObject = event.stream;
  adminVideo.autoplay = true;
  adminVideo.muted = true;
  adminVideo.setAttribute("data-live", "");
  adminVideo.addEventListener("loadedmetadata", () => {
    adminVideo.play();
  });
  adminVideo.style.display = "block";

  if (connection.isInitiator) {
    btnToggleVideo.querySelector("img").src = "img/camera.svg";
    btnToggleVideo.style.background = "#1f9c60";
  }
};

connection.onclose = function (event) {
  if (event.userid === connection.sessionid) {
    window.location.replace("/");
  }
};

connection.onstreamended = function (event) {
  adminVideo.style.display = "none";
  adminVideo.srcObject = null;

  if (connection.isInitiator) {
    btnToggleVideo.querySelector("img").src = "img/video-off.svg";
    btnToggleVideo.style.background = "#db4e66";
  }
};

connection.onExtraDataUpdated = function (event) {
  const permission = event.extra.chatPermission;
  const userId = event.userid;
  const adminId = getBroadcastId();

  if (userId === adminId) {
    cbAllcanSendMessages.checked = permission;

    if (!connection.isInitiator) {
      if (!permission) {
        fileContainer.style.display = "none";
        chatIsBlocked.style.display = "flex";
        chatForm.style.display = "none";
      } else {
        fileContainer.style.display = "block";
        chatForm.style.display = "flex";
        chatIsBlocked.style.display = "none";
      }
    }

    setSwitcherProps();
  }
};

connection.onMediaError = function (error) {
  trottleSoundPlay("alert");
  permissionModalInstance.show();
};

connection.onFileEnd = function (file) {
  appendMessage(file);
};

connection.onFileProgress = function () {};

connection.onFileStart = function () {};

function onFileSelected(file) {
  if (file && (file instanceof File || file instanceof Blob) && file.size) {
    const filePreview = getFilePreview(file);
    selectedFile = file;
    clearFileContainer();
    fileContainer.appendChild(filePreview);
  } else {
    Toastify({
      text: "Такой файл не может быть загружен",
      gravity: "top",
      position: "center",
      className: "toast toast--destructive",
    }).showToast();
  }
}

// ####################################################################
// Хендлеры
// ####################################################################

function leaveHandler() {
  connection.getAllParticipants().forEach((pid) => {
    connection.disconnectWith(pid);
  });

  connection.attachStreams.forEach((localStream) => {
    localStream.stop();
  });

  connection.closeSocket();
  window.location.replace("/");
}

function handleHandUp() {}

function handleMessagesPermissions(e) {
  e.preventDefault();

  if (cbAllcanSendMessages.checked) {
    connection.extra.chatPermission = true;
  } else {
    connection.extra.chatPermission = false;
  }

  setSwitcherProps();

  connection.updateExtraData();
}

function setSwitcherProps() {
  const switchInstance = chatSwitch._tippy;

  if (cbAllcanSendMessages.checked) {
    switchInstance.setProps({
      content: "Все могут отправлять сообщения",
    });
  } else {
    switchInstance.setProps({
      content: "Отправка сообщений ограничена",
    });
  }
}

function handlePanelState(elem, callback) {
  callback = callback || function () {};

  if (elem.hasAttribute("data-open")) {
    elem.style.right = "-40rem";
    grid.style.right = "1.6rem";
    elem.removeAttribute("data-open");
  } else {
    hideAllPanels();
    elem.setAttribute("data-open", "");
    elem.style.right = "1.6rem";
    grid.style.right = "39rem";
  }

  callback();
}

function toggleChat(e) {
  e.preventDefault();

  handlePanelState(chat);

  const notifyBadge = btnChat.querySelector(".badge");

  if (notifyBadge) {
    notifyBadge.remove();
  }
}

function toggleVideo() {
  if (connection.DetectRTC.hasWebcam === false) {
    trottleSoundPlay("alert");
    permissionModalInstance.show();
    return;
  }

  if (adminVideo.hasAttribute("data-live")) {
    adminVideo.removeAttribute("data-live");

    connection.attachStreams.forEach(function (localStream) {
      localStream.stop();
    });
  } else {
    connection.addStream({
      video: true,
      audio: true,
      oneway: true,
    });
  }
}

function toggleMicro() {
  if (connection.DetectRTC.hasMicrophone === false) {
    permissionModalInstance.show();
    return;
  }
}

function toggleMembers(e) {
  e.preventDefault();

  handlePanelState(members);
}

function toggleInfo(e) {
  e.preventDefault();

  handlePanelState(info);
}

function hideAllPanels() {
  panels.forEach((panel) => {
    if (panel.hasAttribute("data-open")) {
      panel.style.right = "-40rem";
      grid.style.right = "1.6rem";
      panel.removeAttribute("data-open");
    }
  });
}

function sendMessage(e) {
  e.preventDefault();

  const message = inputChat.value.trim();

  if (message !== "") {
    connection.send({ chatMessage: message });
    appendMessage({ data: { chatMessage: message } });
    inputChat.value = "";
  } else {
    inputChat.focus();
  }

  if (selectedFile !== null) {
    connection.send(selectedFile);
    clearFileContainer();
    selectedFile = null;
  }
}

function appendMessage(data) {
  const curretnDate = new Date();
  const currentMinutes = curretnDate.getMinutes();
  const currentHours = curretnDate.getHours();

  const msg = document.createElement("div");
  msg.setAttribute("data-user-id", data.userid || connection.userid);
  msg.classList.add("message");

  const lastMsgSenderId = [].slice.call(messagesContainer.children, -1)[0]?.getAttribute("data-user-id");

  if (data.url && data.name && data.size && !data.data) {
    const url = data.url || URL.createObjectURL(data);
    const sender = data.extra.userid;

    msg.innerHTML = `
    ${
      lastMsgSenderId === sender
        ? ""
        : `<div class="message__meta">
      <div class="message__autor">${connection.userid !== sender ? connection.getExtraData(sender).userName : "Вы"}</div>
        <div class="message__time">${currentHours}:${currentMinutes.toString().length < 2 ? "0" + currentMinutes : currentMinutes}</div>
      </div>`
    }
    <div class="message__content">
      <a href="${url}" class="message__content-link" target="_blank" download="${data.name}">Файл: ${data.name}</a>
    </div>`;
  } else {
    const currentId = data.userid ? data.userid : connection.userid;
    msg.innerHTML = `
    ${
      lastMsgSenderId === currentId
        ? ""
        : `<div class="message__meta"}">
        <div class="message__autor">${data.userid ? data.extra.userName : "Вы"}</div>
          <div class="message__time">${currentHours}:${currentMinutes.toString().length < 2 ? "0" + currentMinutes : currentMinutes}</div>
      </div>`
    }
    <div class="message__content">${data.data.chatMessage}</div>`;
  }

  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  messageNotify();
}

function getAllmembers() {
  const members = [
    {
      member: connection.peers[connection.userid],
      userName: connection.extra.userName + "(Вы)",
      userId: connection.userid,
    },
  ];
  connection.getAllParticipants().forEach((participantId) => {
    const member = connection.peers[participantId];
    const userName = member.extra.userName;
    const userId = member.userid;

    members.push({
      member,
      userName,
      userId,
    });
  });

  return members;
}

function renderMembersList() {
  const members = getAllmembers();

  [].forEach.call(membersList.children, (child) => {
    child.remove();
  });

  members.forEach((member) => {
    const user = document.createElement("div");
    user.classList.add("user");
    user.innerHTML = `
      <div class="user__wrapper">
        <div class="user__name" data-user-id='${member.userId}'>${member.userName}</div>
        ${
          connection.isInitiator
            ? `<div class="user__btns">
            <button class="button button--ghost" style="padding: .4rem .5rem !important; font-size: 1.3rem; background: var(--dvgups-slate-100) !important; color: var(--text-color) !important">Заблокировать</button>
            <button class="button button--ghost" style="padding: .4rem .5rem !important; font-size: 1.3rem; background: var(--dvgups-slate-100) !important; color: var(--text-color) !important">Выгнать</button>
          </div>`
            : ""
        }
      </div>
    `;
    membersList.appendChild(user);
  });
}

function handleFileSelect(e) {
  e.preventDefault();

  const fileSelector = new FileSelector();
  fileSelector.accept = "*.*";

  fileSelector.selectSingleFile(function (file) {
    onFileSelected(file);
  });
}

// ####################################################################
// Хелперы
// ####################################################################

function getFilePreview(file) {
  const filePreview = document.createElement("div");
  filePreview.classList.add("file-preview");
  filePreview.innerHTML = `
    <div class="file-preview__name">${file.name}</div>
    <button type="button" class="btn-close file-preview__remove" style="width: 0.2rem; height: 0.2rem" onclick='this.parentNode.remove(); selectedFile = null;'></div>
  `;
  return filePreview;
}

function clearFileContainer() {
  [].forEach.call(fileContainer.children, (child) => child.remove());
}

function setBadge(element, badgeContent, bgColor, bagteTooltip) {
  const badge = document.createElement("div");
  badge.classList.add("badge");

  if (bgColor) {
    badge.style.backgroundColor = bgColor;
  }

  badge.innerHTML = `<div class="badge__content">${badgeContent || ""}</div>`;

  if (bagteTooltip && bagteTooltip.toString() !== "") {
    tippy(badge, {
      content: bagteTooltip,
    });
  }

  if (element && !element.querySelector(".badge")) {
    element.appendChild(badge);
  }
}

// ####################################################################
// Нотификаторы
// ####################################################################

function messageNotify() {
  if (!chat.hasAttribute("data-open")) {
    setBadge(btnChat, "", "#EF4444");
  }
}

function mediaDevicesNotify() {
  if (connection.DetectRTC.hasMicrophone === false) {
    setBadge(btnToggleMicrophone, "!", "#fa7b17", "Нет доступа к микрофону");
  }

  if (connection.DetectRTC.hasWebcam === false) {
    setBadge(btnToggleVideo, "!", "#fa7b17", "Нет доступа к камере");
  }
}

let PREV_COUNT_USER = 0;

function notifyAboutNewViewer() {
  if (PREV_COUNT_USER > 0 && VIEWERS_COUNT > 0) return;

  if (VIEWERS_COUNT > 0) {
    participants.style.display = "block";
  } else {
    participants.style.display = "none";
  }
}
