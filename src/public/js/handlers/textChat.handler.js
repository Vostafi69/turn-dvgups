function textChatHandler(connection) {
  const inputTextChat = document.querySelector(".input-text-chat");

  inputTextChat.addEventListener("keyup", (e) => {
    if (e.keyCode !== 13) return;

    this.value = this.value.replace(/^\s+|\s+$/g, "");
    if (!this.value.length) return;

    connection.send(this.value);
    appendDIV(this.value);
    this.value = "";
  });

  const chatContainer = document.querySelector(".chat-output");

  function appendDIV(event) {
    const div = document.createElement("div");
    div.innerHTML = event.data || event;
    chatContainer.insertBefore(div, chatContainer.firstChild);
    div.tabIndex = 0;
    div.focus();
    inputTextChat.focus();
  }
}

module.exports = textChatHandler;
