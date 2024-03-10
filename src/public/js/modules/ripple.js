function ripple() {
  const haveRipples = document.querySelectorAll(".ripple");

  if (haveRipples.length === 0) return;

  haveRipples.forEach((hasRipple) => {
    const container = hasRipple.querySelector(".ripple__container");
    container.addEventListener("click", (e) => {
      const rippleItem = document.createElement("span");
      rippleItem.classList.add("ripple__item");

      const rippleColor = getRippleColor(hasRipple);
      if (rippleColor) {
        const isVariable = getIsVariable(hasRipple);
        const themeColor = checkRippleTheme(rippleColor);

        if (isVariable) {
          rippleItem.classList.add("ripple__item--variable");
        }

        if (themeColor) {
          rippleItem.classList.add(themeColor);
        }
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
}

function checkRippleTheme(rippleColor) {
  if (rippleColor === "light") return "ripple__item--light";
}

function getRippleColor(container) {
  const rippleColor = container.dataset.rippleColor || "dark";
  return rippleColor;
}

function getIsVariable(container) {
  const isVariable = container.dataset.rippleValue || false;
  return isVariable;
}

function getRemoveDelay(rippleItem) {
  const animDuration = getComputedStyle(rippleItem).animationDuration;
  return animDuration.includes("ms")
    ? animDuration.replace("ms", "")
    : animDuration.replace("s", "") * 1000;
}

export default ripple;
