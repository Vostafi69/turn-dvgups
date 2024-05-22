import connection from "./connection";
import ripple from "./modules/ripple";
import { Modal } from "../libs/mdb/mdb.es.min";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import ClipboardJS from "clipboard";

// ####################################################################
// Константы
// ####################################################################

const LOADER_TIMEOUT = 500;
const TOOLTIP_TIMEOUT = 1000;

// ####################################################################
// Элементы страницы
// ####################################################################

const loader = document.querySelector(".loader");
const wrapper = document.querySelector(".wrapper");
const btnCopy = document.querySelector(".btn-clipboard");
const btnShareLinkClose = document.getElementById("btn-share-link-close");
const shareLinkModal = document.querySelector(".share-link-modal");
const btnToggleShareModal = document.getElementById("btn-toggle-share-modal");
const lobby = lobbyTemplate.content.cloneNode(true);
const btnLeave = document.getElementById("btn-leave");
const btnChat = document.getElementById("btn-chat");
const btnToggleVideo = document.getElementById("btn-toggle-video");
const btnToggleMicrophone = document.getElementById("btn-toggle-microphone");
const btnScreenShare = document.getElementById("btn-screen-share");
const btnMembers = document.getElementById("btn-members");
const btnHandUp = document.getElementById("btn-hand-up");
const btnInfo = document.getElementById("btn-toggle-info");
const grid = document.querySelector(".grid");
const chat = document.querySelector(".chat");
const members = document.querySelector(".members");
const info = document.querySelector(".info");
const panels = document.querySelectorAll(".panel");

// ####################################################################
// Управленеи присоединением | созданием видеотрансляции
// ####################################################################

connection.session = {
  audio: true,
  video: true,
  oneway: true,
  data: true,
};

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
}

function initBroadcast() {
  const broadcastId = getBroadcastId();
  const params = new URLSearchParams(document.location.search);

  const event = params.get("event");

  if (event === "open") {
    initLobby(broadcastId);
  } else {
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
      btnContinues.innerHTML =
        '<div class="loader-small"></div><span style="margin-left: 0.5rem;">Создание...</span>';

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
      stream = stream;
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
  const tracks = stream.getTracks();

  tracks.forEach((track) => {
    track.stop();
  });

  videoElem.srcObject = null;
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

initBroadcast();

// ####################################################################
// Процесы видеотрансляции
// ####################################################################

function broadcasting() {
  initToolTips();

  if (!connection.isInitiator) {
    shareLinkModal.remove();
    btnToggleShareModal.remove();
  } else {
    initClipBoard();

    btnToggleShareModal.addEventListener("click", () => {
      shareLinkModal.classList.toggle("share-link-modal--hiden");
    });
  }

  btnChat.addEventListener("click", toggleChat);
  btnMembers.addEventListener("click", toggleMembers);
  btnInfo.addEventListener("click", toggleInfo);
}

connection.onopen = function (event) {
  connection.send("Hello everyone!");
};

connection.onmessage = function (event) {
  if (event.data) {
    console.log(event.data);
    return;
  }
};

connection.onNumberOfBroadcastViewersUpdated = function (event) {
  console.log(
    "Number of broadcast (",
    event.broadcastId,
    ") viewers",
    event.numberOfBroadcastViewers
  );
};

// ####################################################################
// Хендлеры
// ####################################################################

function toggleChat(e) {
  e.preventDefault();

  if (chat.hasAttribute("data-open")) {
    chat.style.right = "-40rem";
    grid.style.right = "1.6rem";
    chat.removeAttribute("data-open");
  } else {
    hideAllPanels();
    chat.setAttribute("data-open", "");
    chat.style.right = "1.6rem";
    grid.style.right = "41.2rem";
  }
}

function toggleMembers(e) {
  e.preventDefault();

  if (members.hasAttribute("data-open")) {
    members.style.right = "-40rem";
    grid.style.right = "1.6rem";
    members.removeAttribute("data-open");
  } else {
    hideAllPanels();
    members.setAttribute("data-open", "");
    members.style.right = "1.6rem";
    grid.style.right = "41.2rem";
  }
}

function toggleInfo(e) {
  e.preventDefault();

  if (info.hasAttribute("data-open")) {
    info.style.right = "-40rem";
    grid.style.right = "1.6rem";
    info.removeAttribute("data-open");
  } else {
    hideAllPanels();
    info.setAttribute("data-open", "");
    info.style.right = "1.6rem";
    grid.style.right = "41.2rem";
  }
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
