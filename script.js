/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Your deployed Cloudflare Worker URL from the Cloudflare dashboard
const WORKER_URL = "https://loreal-chatbot-api.malachie1331.workers.dev/";

// Store the conversation history so the assistant remembers context
const messages = [
  {
    role: "system",
    content:
      "You are the L'Oréal Smart Product Advisor. Help users discover L'Oréal makeup, skincare, haircare, and fragrance products and build personalized routines. Stay helpful, concise, and focused on L'Oréal beauty topics.",
  },
];

// Helper function to add a message bubble to the chat window
function appendMessage(role, text) {
  const msgEl = document.createElement("div");
  msgEl.className = `msg ${role}`;
  msgEl.textContent = text;
  chatWindow.appendChild(msgEl);

  // Scroll to the newest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msgEl;
}

// Show initial greeting message
appendMessage("ai", "👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Show the user's message and add it to the conversation history
  appendMessage("user", `You: ${text}`);
  messages.push({ role: "user", content: text });

  // Clear input and disable the send button while waiting for a reply
  userInput.value = "";
  sendBtn.disabled = true;

  // Show a temporary loading message
  const loadingMsg = appendMessage("ai", "Thinking…");

  // Guide the user if they haven't set their Cloudflare Worker URL yet
  if (WORKER_URL.includes("your-subdomain")) {
    loadingMsg.textContent =
      "Please deploy RESOURCE_cloudflare-worker.js to Cloudflare Workers and update WORKER_URL in script.js with your Worker URL.";
    sendBtn.disabled = false;
    return;
  }

  try {
    // Send the messages array to your Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Worker returned status ${response.status}`);
    }

    const data = await response.json();

    // Extract the assistant's reply from the OpenAI-format response
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error(
        data.error?.message || "No reply returned from Cloudflare Worker."
      );
    }

    // Update the loading message with the reply and save it to history
    loadingMsg.textContent = reply;
    messages.push({ role: "assistant", content: reply });
  } catch (error) {
    loadingMsg.textContent = `Sorry, I could not reach the assistant: ${error.message}`;
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
});
