import Connection from "./Connection";
import { ICE_SERVERS, SOCKET_URL } from "../utils/constants";

const connection = Connection.getInstance();

connection.socketURL = SOCKET_URL;
connection.socketMessageEvent = "audio-video-file-chat-demo";
connection.enableFileSharing = true;
connection.session = { audio: true, video: true, data: true };
connection.sdpConstraints.mandatory = { OfferToReceiveAudio: true, OfferToReceiveVideo: true };
connection.iceServers = [{ urls: ICE_SERVERS }];
connection.videosContainer = document.querySelector(".videos-container");

connection.onstream = (event) => {};

connection.onstreamended = (event) => {};

connection.onEntireSessionClosed = (event) => {};

connection.onUserIdAlreadyTaken = (event) => {};

export default connection;
