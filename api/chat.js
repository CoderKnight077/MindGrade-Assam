const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1500;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function isValidMessage(message) {
  return (
    message &&
    typeof message === "object" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Use POST to ask the study helper." });
  }

  const messages = req.body && req.body.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isValidMessage) ||
    messages[messages.length - 1].role !== "user"
  ) {
    return sendJson(res, 400, { error: "Please send a valid study question." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not configured for the study helper.");
    return sendJson(res, 503, { error: "The study helper is not configured yet." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, 20000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are Aspirants Academy's study helper for Assam board students in Classes 9 and 10. Explain concepts clearly in age-appropriate language, show math and science reasoning step by step, and encourage learning rather than simply giving unexplained answers. Be concise. If a question is ambiguous, ask a clarifying question. Do not claim your answers are guaranteed correct."
          },
          ...messages.map(function (message) {
            return { role: message.role, content: message.content.trim() };
          })
        ]
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error("OpenAI study helper request failed with status", response.status);
      return sendJson(res, 502, { error: "The AI service could not answer right now." });
    }

    const reply = payload.choices && payload.choices[0] && payload.choices[0].message &&
      payload.choices[0].message.content;
    if (typeof reply !== "string" || !reply.trim()) {
      console.error("OpenAI study helper response did not contain a text answer.");
      return sendJson(res, 502, { error: "The AI service returned an invalid answer." });
    }

    return sendJson(res, 200, { reply: reply.trim() });
  } catch (error) {
    if (error.name === "AbortError") {
      return sendJson(res, 504, { error: "The AI response took too long. Please try again." });
    }
    console.error("OpenAI study helper request failed:", error);
    return sendJson(res, 502, { error: "The AI service could not be reached. Please try again." });
  } finally {
    clearTimeout(timeout);
  }
};
