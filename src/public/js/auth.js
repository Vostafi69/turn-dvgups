import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const btnAuth = document.getElementById("button-login");
const inputLogin = document.getElementById("input-login");
const inputPassword = document.getElementById("input-password");

const btnLogout = document.getElementById("btn-logout");

if (btnAuth) {
  btnAuth.addEventListener("click", async (e) => {
    e.preventDefault();

    if (inputLogin.value === "" || inputPassword.value === "") {
      return;
    }

    const user = { login: inputLogin.value, password: inputPassword.value };

    btnAuth.innerHTML = '<div class="loader-small"></div>';
    btnAuth.disabled = true;

    try {
      const res = await fetch("/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) });

      if (res.status === 400) {
        const { message } = await res.json();

        Toastify({
          text: message || "Неизвестная ошибка",
          gravity: "top",
          position: "center",
          className: "toast toast--destructive",
        }).showToast();

        setTimeout(() => {
          btnAuth.innerHTML = "Войти";
          btnAuth.disabled = false;
        }, 500);

        return;
      }

      if (res.status === 200) {
        window.location.replace("/");
      }
    } catch (e) {
      Toastify({
        text: e || "Неизвестная ошибка",
        gravity: "top",
        position: "center",
        className: "toast toast--destructive",
      }).showToast();
    }

    setTimeout(() => {
      btnAuth.innerHTML = "Войти";
      btnAuth.disabled = false;
    }, 500);
  });
}

if (btnLogout) {
  btnLogout.addEventListener("click", async (e) => {
    e.preventDefault();

    console.log(123);

    fetch("/logout", { method: "POST", headers: { "Content-Type": "application/json" } })
      .then((res) => {
        if (res.status === 200) {
          window.location.replace("/login");
        } else {
          const { message } = res.json();
          Toastify({
            text: message || "Неизвестная ошибка",
            gravity: "top",
            position: "center",
            className: "toast toast--destructive",
          }).showToast();
        }
      })
      .catch((err) => {
        Toastify({
          text: err || "Неизвестная ошибка",
          gravity: "top",
          position: "center",
          className: "toast toast--destructive",
        }).showToast();
      });
  });
}
