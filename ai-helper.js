document.addEventListener("DOMContentLoaded", function () {
  const launcher = document.getElementById("aiLauncher");
  const panel = document.getElementById("aiPanel");
  const closeButton = document.getElementById("aiClose");
  const form = document.getElementById("aiForm");
  const questionInput = document.getElementById("aiQuestion");
  const sendButton = document.getElementById("aiSend");
  const messageList = document.getElementById("aiMessages");
  const status = document.getElementById("aiStatus");
  const conversation = [];

  function addMessage(text, role, extraClass) {
    const message = document.createElement("p");
    message.className = "ai-message ai-message-" + role;
    if (extraClass) {
      message.classList.add(extraClass);
    }
    message.textContent = text;
    messageList.appendChild(message);
    messageList.scrollTop = messageList.scrollHeight;
    return message;
  }

  function setOpen(isOpen) {
    panel.hidden = !isOpen;
    launcher.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      questionInput.focus();
    } else {
      launcher.focus();
    }
  }

  launcher.addEventListener("click", function () {
    setOpen(panel.hidden);
  });

  closeButton.addEventListener("click", function () {
    setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
    }
  });

  document.querySelectorAll(".ai-suggestions [data-prompt]").forEach(function (button) {
    button.addEventListener("click", function () {
      questionInput.value = button.dataset.prompt;
      questionInput.focus();
    });
  });

  questionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question || sendButton.disabled) {
      return;
    }

    status.textContent = "";
    questionInput.value = "";
    questionInput.disabled = true;
    sendButton.disabled = true;
    addMessage(question, "user");
    conversation.push({ role: "user", content: question });

    const loadingMessage = addMessage("Thinking…", "assistant", "ai-message-loading");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.slice(-10) })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "The study helper could not answer right now.");
      }
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("The study helper returned an empty answer. Please try again.");
      }

      loadingMessage.remove();
      addMessage(result.reply, "assistant");
      conversation.push({ role: "assistant", content: result.reply });
    } catch (error) {
      loadingMessage.remove();
      addMessage("I couldn't get an answer just now. Please try again in a moment.", "assistant");
      status.textContent = error.message;
    } finally {
      questionInput.disabled = false;
      sendButton.disabled = false;
      questionInput.focus();
    }
  });
});
