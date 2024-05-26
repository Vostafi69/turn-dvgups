import ripple from "./modules/ripple";
import { HRLP_SWIPER, PARTICIPANTS_SWIPER } from "./modules/swiper";
import { mobileNav, throttleCreateRoomMobile, createRoomMobile } from "./modules/mobile-nav";
import "../libs/mdb/mdb.modal.css";
import "../libs/mdb/mdb.btn-close.css";

ripple();
mobileNav();
window.addEventListener("resize", throttleCreateRoomMobile, false);
createRoomMobile();
