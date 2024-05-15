import MobileDetect from "mobile-detect";
import { throttle } from "lodash";

export function mobileNav() {
  const navBtn = document.querySelector(".mobile-nav-btn");
  const nav = document.querySelector(".mobile-nav");
  const menuIcon = document.querySelector(".nav-icon");

  if (!navBtn && !nav && !menuIcon) return;

  navBtn.addEventListener("click", () => {
    nav.classList.toggle("mobile-nav--open");
    menuIcon.classList.toggle("nav-icon--active");
    document.body.classList.toggle("no-scroll");
  });
}

export function createRoomMobile() {
  const isMobile = new MobileDetect(window.navigator.userAgent);
  const createRoomOption = document.querySelector("[data-action='create-conf']");

  if (createRoomOption) {
    if (isMobile.mobile() || window.innerWidth <= 768) {
      createRoomOption.style.display = "none";
    } else {
      createRoomOption.style.display = "flex";
    }
  }
}

export const throttleCreateRoomMobile = throttle(createRoomMobile, 500);
