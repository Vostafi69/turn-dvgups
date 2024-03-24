import Connection from "./Connection";
import { ICE_SERVERS, SOCKET_URL } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";
import CreateURL from "../helpers/CreateURL";

const connection = Connection.getInstance();

connection.socketURL = SOCKET_URL;
connection.iceServers = [{ urls: ICE_SERVERS }];
connection.autoCreateMediaElement = false;
connection.dontCaptureUserMedia = true;

export function openRoom() {
  const openRoomButton = document.querySelector(".button-open-room");

  if (!openRoomButton) return;

  openRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const roomid = uuidv4();

    const href = CreateURL.addParams("https://localhost:8000/conf/room", {
      id: roomid,
      eventType: "open",
    });

    window.open(href, "_self");
  });
}

export function joinRoom() {
  const joinRoomButton = document.querySelector(".button-join-room");

  if (!joinRoomButton) return;

  joinRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const roomid = document.querySelector(".input-join-string").value;

    const href = CreateURL.addParams("https://localhost:8000/conf/room", {
      id: roomid,
      eventType: "join",
    });

    window.open(href, "_self");
  });
}
