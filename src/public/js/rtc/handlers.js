export function toggleMicro() {}

export function toggleCamera() {}

export function toggleScreen() {}

export function toggleCanvas() {}

export function toggleChat() {
  const chatButton = document.getElementById("btn-chat");
  const room = document.querySelector(".room");

  if (!chatButton || !room) return;

  chatButton.addEventListener("click", (_e) => {
    room.classList.toggle("room--chat--open");
  });
}
