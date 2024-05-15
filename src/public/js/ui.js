import ripple from "./modules/ripple";
import { SWIPER } from "./modules/swiper";
import { mobileNav, throttleCreateRoomMobile, createRoomMobile } from "./modules/mobile-nav";

ripple();
mobileNav();
window.addEventListener("resize", throttleCreateRoomMobile, false);
createRoomMobile();
