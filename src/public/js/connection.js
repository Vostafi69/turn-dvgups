import { ICE_SERVERS, SOCKET_URL } from "./utils/constants";

const connection = new RTCMultiConnection();

connection.socketURL = SOCKET_URL;
connection.iceServers = [{ urls: ICE_SERVERS }];
connection.autoCreateMediaElement = false;
connection.dontCaptureUserMedia = true;
connection.autoCloseEntireSession = true;
connection.autoSaveToDisk = false;
connection.enableScalableBroadcast = true;
connection.maxRelayLimitPerUser = 1;
connection.enableFileSharing = true;
connection.session = { audio: true, video: true, oneway: true, data: true };
connection.chunkSize = 16000;

export default connection;
