import Swiper from "swiper";
import "swiper/css";

export const SWIPER = new Swiper(".swiper", {
  slidesPerView: "auto",
  spaceBetween: 16,
  freeMode: true,

  breakpoints: {
    1100: {
      spaceBetween: 0,
    },
  },
});
