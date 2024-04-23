import Connection from "./Connection";
import Canvas from "./CanvasDesigner";
import { SOCKET_URL, ICE_SERVERS } from "../utils/constants";
import { toggleChat } from "./handlers";

const connection = Connection.getInstance();
const designer = Canvas.getInstance();

designer.setTools({
  pencil: true,
  text: true,
  image: true,
  pdf: true,
  eraser: true,
  line: true,
  arrow: true,
  dragSingle: true,
  dragMultiple: true,
  arc: true,
  rectangle: true,
  quadratic: false,
  bezier: true,
  marker: true,
  zoom: false,
  lineWidth: false,
  colorsPicker: false,
  extraOptions: false,
  code: false,
  undo: true,
});

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

connection.onmessage = function (event) {
  if (event.data.message) {
    showMessage(event);
    return;
  }

  if (event.data === "plz-sync-points") {
    designer.sync();
    return;
  }

  designer.syncData(event.data);
};

export function initRoom() {
  const params = new URLSearchParams(document.location.search);
  const roomid = params.get("id");
  const eventType = params.get("event");

  if (params.has("public")) {
    connection.publicRoomIdentifier = params.get("public");
  }

  if (!roomid) return;

  checkUserHasRTC(() => {
    if (eventType === "open") {
      connection.open(roomid, (_isOpened, _roomid, error) => {
        if (error) console.log(error);
      });
    } else {
      connection.join(roomid, (_isJoined, _roomid, error) => {
        if (error) console.log(error);
      });
    }

    toggleMicro();
    toggleCamera();
    membersHandler();
    sendMessage();
    toggleChat();
    canvas();
  });
}

connection.onopen = function (event) {
  connection.onUserStatusChanged(event);

  if (designer.pointsLength <= 0) {
    setTimeout(function () {
      connection.send("plz-sync-points");
    }, 1000);
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

connection.onopen = function (event) {
  connection.onUserStatusChanged(event);
};

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

function canvas() {
  designer.widgetHtmlURL = "libs/canvas/widget.html";
  designer.widgetJsURL = "libs/canvas/widget.min.js";
  designer.appendTo(document.querySelector(".canvas-container"));

  designer.setSelected("pencil");

  designer.addSyncListener(function (data) {
    connection.send(data);
  });
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
