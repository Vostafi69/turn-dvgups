import { ICE_SERVERS, SOCKET_URL } from "../utils/constants";

const connection = new RTCMultiConnection();

connection.socketURL = SOCKET_URL;
connection.maxParticipantsAllowed = 150;
connection.session = { audio: true, video: true, data: true };
connection.sdpConstraints.mandatory = { OfferToReceiveAudio: true, OfferToReceiveVideo: true };
connection.iceServers = [{ urls: ICE_SERVERS }];
connection.videosContainer = document.querySelector(".videos-container");
connection.autoCreateMediaElement = false;
connection.dontCaptureUserMedia = false;
connection.autoCloseEntireSession = true;
connection.chunkSize = 16000;
connection.enableFileSharing = false;
connection.autoSaveToDisk = false;
connection.codecs = { video: "H264", audio: "G722" };

export default connection;
