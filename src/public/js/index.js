import ripple from "./modules/ripple";
import { openRoom, joinRoom } from "./rtc/index";
import { initRoom } from "./rtc/room";

ripple();
openRoom();
joinRoom();
initRoom();
