import Connection from "./Connection";
import { SOCKET_URL, ICE_SERVERS } from "../utils/constants";

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

/**
 * Инициализирует комнату
 */
export function initRoom() {
  const params = new URLSearchParams(document.location.search);
  const roomid = params.get("id");
  const eventType = params.get("eventType");

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

    if (connection.isInitiator) {
      const banner = document.createElement("h1");
      banner.textContent = "Вы администратор!";
      document.body.appendChild(banner);
    }

    toggleMicro();
    toggleCamera();
  });
}

/**
 * Проверяет наличие и разрешение использования устройств ввода и вывода
 * @param {Function} cb
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

function leave() {}

/**
 * Переключает микрофон у пользователя
 */
function toggleMicro() {
  const toggleMicroButton = document.querySelector(".button-toggle-micro");

  toggleMicroButton.addEventListener("click", (_e) => {
    if (connection.extra.isAudioMuted) {
      connection.addStream({ audio: true });
      connection.extra.isAudioMuted = false;
    } else {
      connection.attachStreams[0].stop();
      connection.extra.isAudioMuted = true;
    }

    connection.updateExtraData();
  });
}

/**
 * Переключает камеру у пользователя
 */
function toggleCamera() {
  const toggleCameraButton = document.querySelector(".button-toggle-camera");

  toggleCameraButton.addEventListener("click", (_e) => {
    if (connection.extra.isVideoMuted) {
      connection.addStream({ video: true });
      connection.extra.isVideoMuted = false;
    } else {
      connection.removeStream({ video: true });
      connection.attachStreams[0].stop();
      connection.extra.isVideoMuted = true;
    }

    connection.updateExtraData();
  });
}

function toggleScreen() {}

function handdUp() {}

function closeRoom() {}
