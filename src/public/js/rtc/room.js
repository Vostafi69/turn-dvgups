import Connection from "./Connection";
import { SOCKET_URL, ICE_SERVERS } from "../utils/constants";
import { toggleChat } from "./handlers";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const connection = Connection.getInstance();

// settings
connection.socketURL = SOCKET_URL;
connection.maxParticipantsAllowed = 1000;
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
connection.codecs = {
  video: "H264",
  audio: "G722",
};

const loader = document.querySelector(".loader");

connection.onmessage = function (event) {
  if (event.data.message) {
    showMessage(event);
    return;
  }
};

export function initRoom() {
  const params = new URLSearchParams(document.location.search);

  const roomid = params.get("id");
  const eventType = params.get("event");
  const publicName = params.get("public-name");

  if (!!publicName) {
    connection.publicRoomIdentifier = "list-public-rooms";
    connection.extra.roomName = publicName;
  }

  if (!roomid) return;

  checkUserHasRTC(() => {
    if (eventType === "open") {
      connection.open(roomid, (isOpened, _roomid, error) => {
        if (isOpened) {
          loader.remove();
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

    toggleMicro();
    toggleCamera();
    membersHandler();
    sendMessage();
    toggleChat();
  });
}

connection.onopen = function (event) {
  connection.onUserStatusChanged(event);

  if (connection.isInitiator === true && event.type === "local") {
    Toastify({
      text: `Строка для подключения: ${connection.sessionid}`,
      gravity: "top",
      position: "center",
      className: "toast",
      duration: 10000,
    }).showToast();
  }
};

connection.onclose =
  connection.onerror =
  connection.onleave =
    function (event) {
      connection.onUserStatusChanged(event);
    };

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

function leave() {}

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

function closeRoom() {}

function membersHandler() {
  const membersCount = document.querySelector(".members-count");
  if (!membersCount) return;

  connection.onUserStatusChanged = function (_event) {
    const allMembers = connection.getAllParticipants();
    membersCount.textContent = allMembers.length + 1;
  };
}
