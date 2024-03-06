function createConf() {
  const btn = document.querySelector(".form__button");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
  });
}

module.exports = createConf;
