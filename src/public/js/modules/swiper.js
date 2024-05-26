import Swiper from "swiper";
import "swiper/css";

export const HRLP_SWIPER = new Swiper("#help-swiper", {
  slidesPerView: "auto",
  spaceBetween: 16,
  freeMode: true,

  breakpoints: {
    1100: {
      spaceBetween: 0,
    },
  },
});

export const PARTICIPANTS_SWIPER = new Swiper("#participants-swiper", {
  slidesPerView: "auto",
  spaceBetween: 16,
  freeMode: true,
  direction: "vertical",
  mousewheel: true,
});
