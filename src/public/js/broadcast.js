import "../libs/FileBufferReader.min";
import connection from "./connection";
import { PUBLIC_ROOM_ID } from "./utils/constants";
import ripple from "./modules/ripple";
import { Modal } from "../libs/mdb/mdb.es.min";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import ion from "./sounds";
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
  adminAudio,
  videoCover,
  videoVolume,
  videoVolumeImg,
  confName,
  btnMembersSearch,
  inputMembersSearch,
  btnGetPdf,
  membersCountOutput,
} from "./elements";
import { throttle } from "lodash";
import { Grid, GridItem } from "./viewersGirid";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// ####################################################################
// Константы
// ####################################################################

const LOADER_TIMEOUT = 500;
const TOOLTIP_TIMEOUT = 1000;
const PLAY_SOUND_TIMEOUT = 2500;

// processes

let selectedFile = null;
let VIEWERS_COUNT = 0;

const devices = {};

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
  tippy(btnMembersSearch, {
    content: "Искать",
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
  tippy(btnGetPdf, {
    content: "Загрузить PDF файл",
  });
  tippy(membersCountOutput, {
    content: "Колличество участников трансляции",
  });
}

function initBroadcast() {
  const broadcastId = getBroadcastId();
  const params = new URLSearchParams(document.location.search);

  const event = params.get("event");
  const confName = params.get("conf-name");

  const info = document.getElementById("panel-with-info");
  const lkUserId = info.dataset.userId;

  initToolTips();

  connection.publicRoomIdentifier = PUBLIC_ROOM_ID;

  connection.extra.confName = confName || "Видеотрансляция";
  connection.extra.userName = members.dataset.userName;
  connection.extra.fullUserName = members.dataset.fullUserName;
  connection.extra.chatPermission = true;

  if (event === "open") {
    initLobby(broadcastId);
    setBadge(btnMembers, 1, "#1f9c60", `Участников: 1`, true);
  } else {
    connection.extra.userId = lkUserId;
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
  const cancelModal = document.getElementById("cancelModal");
  const btnCancelModal = document.getElementById("btn-modal-cancel");

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

  const videoSelect = document.getElementById("video-select");
  const audioSelect = document.getElementById("audio-select");
  const audioCodecsSelect = document.getElementById("audio-codecs-select");
  const videoCodecsSelect = document.getElementById("video-codecs-select");

  detectRTC();
  getUserDevices(videoSelect, audioSelect, videoCodecsSelect, audioCodecsSelect);
}

function getUserDevices(videoSelect, audioSelect, videoCodecsSelect, audioCodecsSelect) {
  const videoSelectInstance = NiceSelect.bind(videoSelect);
  const audioSelectInstance = NiceSelect.bind(audioSelect);
  NiceSelect.bind(audioCodecsSelect);
  NiceSelect.bind(videoCodecsSelect);

  connection.DetectRTC.load(() => {
    connection.DetectRTC.videoInputDevices.forEach((device) => {
      const option = document.createElement("option");
      option.text = device.label;
      option.value = device.deviceId;

      videoSelect.appendChild(option);

      videoSelectInstance.update();
    });

    connection.DetectRTC.audioInputDevices.forEach((device) => {
      const option = document.createElement("option");
      option.text = device.label;
      option.value = device.deviceId;

      audioSelect.appendChild(option);

      audioSelectInstance.update();
    });

    devices.audioId = audioSelect.value;
    devices.videoId = videoSelect.value;

    audioCodecsSelect.addEventListener("change", (e) => {
      const codec = e.target.value;
      connection.codecs.audio = codec;
    });

    videoCodecsSelect.addEventListener("change", (e) => {
      const codec = e.target.value;
      connection.codecs.video = codec;
    });

    audioSelect.addEventListener("change", (e) => {
      devices.audioId = e.target.value;
      detectRTC(devices);
    });

    videoSelect.addEventListener("change", (e) => {
      devices.videoId = e.target.value;
      detectRTC(devices);
    });
  });
}

function detectRTC(devices) {
  const lobbyBtnGroup = document.querySelector(".lobby__btn-group");
  const lobbyLoader = document.querySelector(".lobby__loader");
  const videoPreview = document.getElementById("videoPreview");

  lobbyBtnGroup.style.display = "none";
  lobbyLoader.style.display = "block";

  const currentAudio = devices ? devices.audioId : true;
  const currentVideo = devices ? devices.videoId : true;

  navigator.mediaDevices
    .getUserMedia({
      video: {
        deviceId: currentVideo || true,
      },
      audio: {
        deviceId: currentAudio || true,
      },
    })
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

    btnHandUp.remove();
    videoVolume.closest("div").remove();

    connection.mediaConstraints = {
      audio: {
        mandatory: {},
        optional: [
          {
            sourceId: devices.audioId,
          },
        ],
      },
      video: {
        mandatory: {},
        optional: [
          {
            sourceId: devices.videoId,
          },
        ],
      },
    };

    if (connection.DetectRTC.browser.name === "Firefox") {
      connection.mediaConstraints = {
        audio: {
          deviceId: devices.audioId,
        },
        video: {
          deviceId: devices.videoId,
        },
      };
    }

    connection.addStream({
      audio: true,
      video: true,
      oneway: true,
    });

    btnToggleShareModal.addEventListener("click", () => {
      shareLinkModal.classList.toggle("share-link-modal--hiden");
    });

    connection.DetectRTC.load(() => {
      if (!connection.DetectRTC.isWebsiteHasMicrophonePermissions || !connection.DetectRTC.hasMicrophone) {
        setBadge(btnToggleMicrophone, "!", "#fa7b17", "Нет доступа к микрофону");

        connection.mediaConstraints.audio = false;
        connection.session.audio = false;

        adminVideo.setAttribute("data-mic-muted", "");
        btnToggleMicrophone.querySelector("img").src = "img/micro-off.svg";
        btnToggleMicrophone.style.background = "#db4e66";
      } else {
        btnToggleMicrophone.querySelector("img").src = "img/microphone.svg";
        btnToggleMicrophone.style.background = "#1f9c60";
      }

      if (!connection.DetectRTC.isWebsiteHasWebcamPermissions || !connection.DetectRTC.hasWebcam) {
        setBadge(btnToggleVideo, "!", "#fa7b17", "Нет доступа к камере");

        connection.mediaConstraints.video = false;
        connection.session.video = false;
      }

      if (!connection.DetectRTC.isScreenCapturingSupported) {
        btnScreenShare.disabled = true;
        setBadge(btnScreenShare, "!", "#fa7b17", "Не поддерживается");
      }
    });
  }

  const throttleHandUp = throttle(handleHandUp, 20000);

  videoVolume.value = 0;
  adminVideo.volume = 0;

  connection.getExtraData(connection.sessionid, (extra) => {
    confName.innerText = extra.confName;
    videoCover.innerText = extra.userName;
    if (!connection.isInitiator) {
      confName.style.borderLeft = "none";
      confName.style.paddingLeft = "0";
    }
  });

  videoVolume.addEventListener("change", toggleVolume);
  adminVideo.addEventListener("dblclick", () => openFullscreen(adminVideo));
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
  btnHandUp.addEventListener("click", throttleHandUp);
  btnScreenShare.addEventListener("click", handleToggleScreen);
  btnMembersSearch.addEventListener("click", handleMembersSearch);
  btnGetPdf.addEventListener("click", getPdfFileHandler);
}

connection.connectSocket((socket) => {
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
  if (connection.isInitiator) {
    connection.getExtraData(event.userid, (extra) => {
      fetch("/checkUserIsBlocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: extra.userId }),
      })
        .then((data) => data.json())
        .then((data) => {
          const { userIsBlocked } = data;
          if (userIsBlocked) {
            connection.disconnectWith(event.userid, "blocked");
          }
        })
        .catch(() => {
          connection.disconnectWith(event.userid, "server-error");
        });
    });
  }
  trottleSoundPlay("add-peer");
};

connection.onclose = function (event) {
  if (event.userid === connection.sessionid) {
    window.location.replace(`/join?message=isEnded`);
  }
};

connection.onmessage = function (event) {
  if (event.data.chatMessage) {
    trottleSoundPlay("message");
    appendMessage(event);
    return;
  }

  if (event.data.handUp) {
    trottleSoundPlay("hand-up");
    Toastify({
      text: `${event.data.handUp.userName} поднял руку!`,
      gravity: "bottom",
      position: "left",
      className: "toast",
      duration: 50000,
      close: true,
    }).showToast();
    return;
  }
};

connection.onNumberOfBroadcastViewersUpdated = function (event) {
  const viewers = event.viewers;

  VIEWERS_COUNT = viewers.length - 1;

  if (VIEWERS_COUNT > 0) {
    gridVideoCover.style.background = "#3c4043";
    notifyAboutNewViewer();
  } else {
    gridVideoCover.style.background = "transparent";
  }

  membersCountOutput.innerText = viewers.length;
  setBadge(btnMembers, viewers.length, "#1f9c60", `Участников: ${viewers.length}`, true);
  updateGrid(viewers);
  renderMembersList(viewers);
};

async function updateGrid(viewers) {
  const broadcastId = getBroadcastId();
  const participants = [];

  viewers.forEach((viewerId) => {
    if (broadcastId === viewerId) return;

    connection.getExtraData(viewerId, (extra) => {
      participants.push(new GridItem(viewerId, extra.userName, "БО241ПИН"));
      viewersGrid.update(participants);
    });
  });

  viewersGrid.update(participants);
}

connection.onstream = function (event) {
  trottleSoundPlay("start");

  if (event.stream.isVideo) {
    adminVideo.srcObject = event.stream;
    adminVideo.autoplay = true;
    adminVideo.setAttribute("data-live", "");
    adminVideo.addEventListener("loadedmetadata", () => {
      adminVideo.play().then(null, () => {
        adminVideo.muted = true;
        adminVideo.play();
      });
    });
    adminVideo.style.display = "block";

    if (connection.isInitiator) {
      adminVideo.muted = true;
      btnToggleVideo.querySelector("img").src = "img/camera.svg";
      btnToggleVideo.style.background = "#1f9c60";

      adminVideo.removeAttribute("data-mic-muted");
      btnToggleMicrophone.querySelector("img").src = "img/microphone.svg";
      btnToggleMicrophone.style.background = "#1f9c60";
    }

    if (!connection.isInitiator) {
      document.addEventListener("click", () => {
        adminVideo.muted = false;
        document.removeEventListener("click", this);
      });
    }

    return;
  }

  if (event.stream.isAudio) {
    adminAudio.srcObject = event.stream;
    adminAudio.autoplay = true;
    adminAudio.setAttribute("data-live", "");
    adminAudio.addEventListener("loadedmetadata", () => {
      adminAudio.play().then(null, () => {
        adminAudio.muted = true;
        adminAudio.play();
      });
    });

    if (connection.isInitiator) {
      adminAudio.muted = true;
      adminAudio.removeAttribute("data-mic-muted");
      btnToggleMicrophone.querySelector("img").src = "img/microphone.svg";
      btnToggleMicrophone.style.background = "#1f9c60";
    }

    if (!connection.isInitiator) {
      document.addEventListener("click", playAudio);

      function playAudio() {
        adminAudio.muted = false;
        adminAudio.play().then(null, () => {
          document.removeEventListener("click", playAudio);
        });
      }
    }

    return;
  }
};

connection.onstreamended = function (event) {
  trottleSoundPlay("stop");

  if (event.stream.isVideo) {
    adminVideo.style.display = "none";
    adminVideo.srcObject = null;

    if (adminVideo.classList.contains("video__player--rev")) {
      adminVideo.classList.remove("video__player--rev");
    }

    if (connection.isInitiator) {
      btnToggleVideo.querySelector("img").src = "img/video-off.svg";
      btnToggleVideo.style.background = "#db4e66";
      adminVideo.removeAttribute("data-live");

      adminVideo.setAttribute("data-mic-muted", "");
      adminAudio.setAttribute("data-mic-muted", "");
      btnToggleMicrophone.querySelector("img").src = "img/micro-off.svg";
      btnToggleMicrophone.style.background = "#db4e66";

      btnScreenShare.style.background = "#db4e66";
    }

    return;
  }

  if (event.stream.isAudio) {
    adminAudio.srcObject = null;

    if (connection.isInitiator) {
      adminAudio.setAttribute("data-mic-muted", "");
      btnToggleMicrophone.querySelector("img").src = "img/micro-off.svg";
      btnToggleMicrophone.style.background = "#db4e66";
    }
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

function handleMembersSearch() {
  const searchValue = inputMembersSearch.value;

  if (searchValue.length > 1) {
    const participants = connection.getAllParticipants();
    participants.unshift(connection.userid);
    renderMembersList(participants, searchValue);
  } else {
    const participants = connection.getAllParticipants();
    participants.unshift(connection.userid);
    renderMembersList(participants);
  }
}

function openFullscreen(elem) {
  console.log(elem);
}

function toggleVolume(e) {
  const currentVolume = e.currentTarget.value / 100;

  if (currentVolume === 0) {
    videoVolumeImg.src = "/img/sound-off.svg";
  } else if (currentVolume > 0 && currentVolume < 0.7) {
    videoVolumeImg.src = "/img/sound-mid.svg";
  } else {
    videoVolumeImg.src = "/img/sound.svg";
  }

  adminVideo.volume = currentVolume;
}

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

function handleToggleScreen() {
  if (btnToggleVideo.querySelector(".badge")) {
    permissionModalInstance.show();
    trottleSoundPlay("alert");
    return;
  }

  if (!btnScreenShare.hasAttribute("data-live")) {
    connection.mediaConstraints.video = true;
    connection.session.video = true;

    connection.addStream({
      screen: {
        video: {
          cursor: "always",
          displaySurface: "monitor",
        },
        audio: false,
      },
      streamCallback: function () {
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then((stream) => {
            connection.attachStreams.push(stream);
            connection.renegotiate();
            adminVideo.classList.add("video__player--rev");
            btnScreenShare.style.backgroundColor = "#1f9c60";
            btnScreenShare.setAttribute("data-live", "");
            btnToggleVideo.querySelector("img").src = "img/video-off.svg";
            btnToggleVideo.style.background = "#db4e66";
          })
          .catch((err) => console.log(err));
      },
    });
  } else {
    btnScreenShare.removeAttribute("data-live");

    btnScreenShare.style.backgroundColor = "#db4e66";

    connection.mediaConstraints.video = false;
    connection.session.video = false;

    connection.attachStreams.forEach((localStream) => {
      localStream.stop();
    });
  }
}

function handleHandUp() {
  connection.send({
    handUp: {
      userName: connection.extra.userName,
    },
  });
}

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
  if (btnToggleVideo.querySelector(".badge")) {
    permissionModalInstance.show();
    trottleSoundPlay("alert");
    return;
  }

  if (adminVideo.hasAttribute("data-live")) {
    connection.attachStreams.forEach((localStream) => {
      localStream.stop();
    });
    connection.mediaConstraints.video = false;
    connection.session.video = false;
  } else {
    if (!adminAudio.hasAttribute("data-mic-muted")) {
      connection.attachStreams.forEach((localStream) => {
        localStream.stop();
      });
    }

    connection.mediaConstraints.video = true;
    connection.session.video = true;

    connection.addStream({
      video: true,
      audio: true,
      oneway: true,
    });
  }
}

function toggleMicro() {
  if (btnToggleMicrophone.querySelector(".badge")) {
    permissionModalInstance.show();
    trottleSoundPlay("alert");
    return;
  }

  if (adminVideo.hasAttribute("data-live")) {
    if (adminVideo.hasAttribute("data-mic-muted")) {
      trottleSoundPlay("start");
      connection.attachStreams.forEach((stream) => {
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          if (track.kind === "audio") {
            track.enabled = true;
          }
        });
      });
      adminVideo.removeAttribute("data-mic-muted");
      btnToggleMicrophone.querySelector("img").src = "img/microphone.svg";
      btnToggleMicrophone.style.background = "#1f9c60";
    } else {
      trottleSoundPlay("stop");
      connection.attachStreams.forEach((stream) => {
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          if (track.kind === "audio") {
            track.enabled = false;
          }
        });
      });
      adminVideo.setAttribute("data-mic-muted", "");
      btnToggleMicrophone.querySelector("img").src = "img/micro-off.svg";
      btnToggleMicrophone.style.background = "#db4e66";
    }

    return;
  }

  if (adminAudio.hasAttribute("data-mic-muted")) {
    connection.addStream({
      audio: true,
      oneway: true,
    });
  } else {
    connection.attachStreams.forEach((localStream) => {
      localStream.stop();
    });
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

function renderMembersList(participants, searchParam) {
  while (membersList.lastChild) {
    membersList.lastChild.remove();
  }

  participants.forEach((participantId) => {
    connection.getExtraData(participantId, (extra) => {
      const user = document.createElement("div");
      const name = extra.fullUserName || connection.extra.fullUserName;
      if (searchParam && !name.startsWith(searchParam)) return;
      user.classList.add("user");
      user.innerHTML = `
      <div class="user__wrapper">
        <div class="user__name-wrapper">
          <div class="user__name" data-user-id='${participantId}'>${name}${connection.userid === participantId ? " (Вы)" : ""}</div>
        </div>
        ${
          connection.isInitiator && participantId !== connection.sessionid
            ? `<div class="user__btns">
            <button id="block" data-user-id="${participantId}" class="button button--ghost" style="padding: 0 .5rem !important; font-size: 1.3rem; background: var(--dvgups-slate-100) !important; color: var(--text-color) !important" onclick={connection.disconnectWith(${participantId})}>Заблокировать</button>
            <button id="disconnect" data-user-id="${participantId}" class="button button--ghost" style="padding: 0 .5rem !important; font-size: 1.3rem; background: var(--dvgups-slate-100) !important; color: var(--text-color) !important" onclick='connection.disconnectWith(participantId)'>Выгнать</button>
          </div>`
            : ""
        }
      </div>
    `;

      const disconnectWithBtn = user.querySelector("#disconnect");
      const blockBtn = user.querySelector("#block");
      if (disconnectWithBtn)
        disconnectWithBtn.onclick = (e) => {
          connection.getExtraData(e.target.dataset.userId, (extra) => {
            Toastify({
              text: `${extra.userName} принудительно покинул трансляцию`,
              gravity: "top",
              position: "center",
              className: "toast toast--success",
            }).showToast();
          });
          connection.disconnectWith(e.target.dataset.userId);
        };
      if (blockBtn) blockBtn.onclick = (e) => blockUser(e.target.dataset.userId);

      membersList.appendChild(user);
    });
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

function getPdfFileHandler() {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  connection.getExtraData(connection.sessionid, (extra) => {
    const docInfo = {
      info: {
        title: "Тестовый документ PDF",
        author: "Александр",
        subject: "Участники видеотрансляции",
        keywords: "Участники",
      },

      header: [
        {
          text: `Участники видеотрансляции ${extra.confName}`,
          fontSize: 20,
          alignment: "center",
          bold: true,
        },
      ],

      content: [
        {
          text: `Номер сассии трансляции: ${connection.sessionid}`,
        },
        {
          text: `Организатор трансляции: ${extra.fullUserName}`,
        },
        {
          text: `Дата получения отчета: ${new Date()}`,
        },
        {
          layout: "lightHorizontalLines",
          table: {
            headerRows: 1,
            widths: ["*", "*", "*"],

            body: [
              ["Номер", "ФИО", "Группа"],
              ...[].map.call(document.querySelectorAll(".user__name"), (user) => {
                return [user.dataset.userId, user.innerText, "БО241ПИН"];
              }),
            ],
          },
        },
      ],

      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + " из " + pageCount,
          alignment: "center",
        };
      },
    };

    pdfMake.createPdf(docInfo).download(`${connection.sessionid}.pdf`);
  });
}

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

function setBadge(element, badgeContent, bgColor, bagteTooltip, update = false) {
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
  } else {
    if (update) {
      element.querySelector(".badge").remove();
      element.appendChild(badge);
    }
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

function notifyAboutNewViewer() {
  if (VIEWERS_COUNT > 0) {
    participants.style.display = "block";
  } else {
    participants.style.display = "none";
  }
}

// ####################################################################
// API
// ####################################################################

function blockUser(userId) {
  connection.getExtraData(userId, (extra) => {
    fetch("/blockUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: extra.userId }),
    })
      .then(() => {
        Toastify({
          text: `${extra.userName} заблокирован`,
          gravity: "top",
          position: "center",
          className: "toast toast--success",
        }).showToast();
        connection.disconnectWith(userId);
      })
      .catch((err) => console.log(err));
  });
}
