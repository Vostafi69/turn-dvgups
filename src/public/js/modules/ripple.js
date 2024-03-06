function ripple() {
  const haveRipples = document.querySelectorAll(".ripple");

  haveRipples.forEach((hasRipple) => {
    const container = hasRipple.querySelector(".ripple__container");
    container.addEventListener("click", (e) => {
      const rippleItem = document.createElement("span");
      rippleItem.classList.add("ripple__item");

      const rippleColor = getRippleColor(hasRipple);
      if (rippleColor === "light") {
        rippleItem.classList.add("ripple__item--light");
      }

      const diameter = Math.sqrt(container.clientHeight ** 2 + container.clientWidth ** 2);
      const radius = diameter / 2;
      rippleItem.style.height = rippleItem.style.width = diameter + "px";
      rippleItem.style.top = `${
        e.pageY - (container.getBoundingClientRect().top + scrollY) - radius
      }px`;
      rippleItem.style.left = `${
        e.pageX - (container.getBoundingClientRect().left + scrollX) - radius
      }px`;
      container.appendChild(rippleItem);

      const removeDelay = getRemoveDelay(rippleItem) || 600;

      setTimeout(() => rippleItem.remove(), removeDelay);
    });
  });

  function getRippleColor(container) {
    const rippleColor = container.dataset.rippleColor || "dark";
    return rippleColor;
  }

  function getRemoveDelay(rippleItem) {
    const animDuration = getComputedStyle(rippleItem).animationDuration;
    return animDuration.includes("ms")
      ? animDuration.replace("ms", "")
      : animDuration.replace("s", "") * 1000;
  }
}

module.exports = ripple;
