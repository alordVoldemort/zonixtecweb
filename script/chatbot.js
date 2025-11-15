// Chatbot JavaScript
class ZonixtecChatbot {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.isTyping = false;
    this.userName = localStorage.getItem("chatbot_user_name") || "";
    this.userEmail = localStorage.getItem("chatbot_user_email") || "";
    this.userPhone = localStorage.getItem("chatbot_user_phone") || "";
    this.init();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem("chatbot_session_id");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatbot_session_id", sessionId);
    }
    return sessionId;
  }

  init() {
    this.injectHTML();
    this.attachEventListeners();
    if (this.userName && this.userEmail) {
      this.showChatInterface();
      this.addBotMessage(
        "Welcome back, " + this.userName + "! How can I help you today?"
      );
    } else {
      this.showWelcomeMessage();
    }
  }

  injectHTML() {
    const chatbotHTML = `
                <div class="chatbot-container">
                    <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open chat">
                        <i class="fas fa-comments"></i>
                    </button>
                    <div class="chatbot-window" id="chatbot-window">
                        <div class="chatbot-header">
                            <div class="chatbot-header-info">
                                <div class="chatbot-avatar">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <div class="chatbot-header-text">
                                    <h3>Zonixtec Assistant</h3>
                                    <p>Online • Ready to help</p>
                                </div>
                            </div>
                            <button class="chatbot-close" id="chatbot-close" aria-label="Close chat">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="chatbot-user-info" id="chatbot-user-info" style="display: none;">
                            <input type="text" id="user-name" placeholder="Your Name *" required>
                            <input type="email" id="user-email" placeholder="Your Email *" required>
                            <input type="tel" id="user-phone" placeholder="Your Phone (optional)">
                            <button id="start-chat-btn">Start Chat</button>
                        </div>
                        
                        <div class="chatbot-messages" id="chatbot-messages"></div>
                        
                        <div class="chatbot-input-container">
                            <form class="chatbot-input-form" id="chatbot-form" autocomplete="off"
                                style="display:flex; align-items:center; width:100%; padding-right:10px;">
                                
                                <input type="text" class="chatbot-input" id="chatbot-input" 
                                    name="chatbot-message" placeholder="Type your message..."
                                    maxlength="500" style="flex:1;"/>

                                <button type="submit" class="chatbot-send" id="chatbot-send">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);
  }

  attachEventListeners() {
    const toggle = document.getElementById("chatbot-toggle");
    const close = document.getElementById("chatbot-close");
    const form = document.getElementById("chatbot-form");
    const startChatBtn = document.getElementById("start-chat-btn");
    const input = document.getElementById("chatbot-input");

    toggle.addEventListener("click", () => this.toggleChat());
    close.addEventListener("click", () => this.closeChat());
    form.addEventListener("submit", (e) => this.handleSubmit(e));
    startChatBtn.addEventListener("click", () => this.startChat());

    // Fix space key issue - prevent global handlers from interfering
    if (input) {
      // Stop propagation for keydown events to prevent global handlers from blocking space
      input.addEventListener(
        "keydown",
        (e) => {
          // Allow space key and other keys to work normally in the input
          if (e.key === " " || e.key === "Spacebar") {
            e.stopPropagation();
          }
        },
        true
      ); // Use capture phase to intercept before other handlers

      // Also handle keypress to ensure space works
      input.addEventListener(
        "keypress",
        (e) => {
          if (e.key === " " || e.keyCode === 32) {
            e.stopPropagation();
          }
        },
        true
      );
    }

    // Add input validation
    this.setupInputValidation();
  }

  setupInputValidation() {
    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");
    const phoneInput = document.getElementById("user-phone");

    // Name validation - only letters and spaces
    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        let value = e.target.value;
        // Remove any characters that are not letters or spaces
        value = value.replace(/[^A-Za-z ]/g, "");
        e.target.value = value;
      });

      nameInput.addEventListener("keypress", (e) => {
        // Prevent non-letter and non-space characters
        const char = String.fromCharCode(e.which);
        if (!/[A-Za-z ]/.test(char)) {
          e.preventDefault();
        }
      });
      nameInput.addEventListener(
        "keydown",
        (e) => {
          if (e.key === " " || e.key === "Spacebar") {
            e.stopPropagation(); // allow space
          }
        },
        true
      );

      nameInput.addEventListener(
        "keypress",
        (e) => {
          if (e.key === " " || e.keyCode === 32) {
            e.stopPropagation(); // allow space
          }
        },
        true
      );
    }

    // Email validation - valid email format
    if (emailInput) {
      emailInput.addEventListener("blur", (e) => {
        const value = e.target.value.trim();
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          e.target.style.borderColor = "#ff4444";
        } else {
          e.target.style.borderColor = "";
        }
      });

      emailInput.addEventListener("input", (e) => {
        // Reset border color on input
        if (e.target.style.borderColor === "rgb(255, 68, 68)") {
          e.target.style.borderColor = "";
        }
      });
    }

    // Phone validation - only numbers, must start with 6,7,8,9, max 10 digits
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        let value = e.target.value;
        // Remove any non-numeric characters
        value = value.replace(/[^0-9]/g, "");

        // If first digit is not 6,7,8,9, clear it
        if (value.length > 0 && !/^[6-9]/.test(value)) {
          value = "";
        }

        // Limit to 10 digits
        if (value.length > 10) {
          value = value.substring(0, 10);
        }

        e.target.value = value;
      });

      phoneInput.addEventListener("keypress", (e) => {
        const char = String.fromCharCode(e.which);
        // Only allow numbers
        if (!/[0-9]/.test(char)) {
          e.preventDefault();
          return;
        }

        const currentValue = e.target.value;
        // If this is the first digit, it must be 6,7,8, or 9
        if (currentValue.length === 0 && !/[6-9]/.test(char)) {
          e.preventDefault();
        }

        // Limit to 10 digits
        if (currentValue.length >= 10) {
          e.preventDefault();
        }
      });

      phoneInput.addEventListener("paste", (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        let value = pastedText.replace(/[^0-9]/g, "");

        // If first digit is not 6,7,8,9, clear it
        if (value.length > 0 && !/^[6-9]/.test(value)) {
          value = "";
        }

        // Limit to 10 digits
        if (value.length > 10) {
          value = value.substring(0, 10);
        }

        e.target.value = value;
      });
    }
  }

  toggleChat() {
    const window = document.getElementById("chatbot-window");
    window.classList.toggle("active");
  }

  closeChat() {
    const window = document.getElementById("chatbot-window");
    window.classList.remove("active");
  }

  showWelcomeMessage() {
    document.getElementById("chatbot-user-info").style.display = "block";
    this.addBotMessage(
      "👋 Welcome to Zonixtec! I'm your AI assistant. Please share your details to get started."
    );
  }

  startChat() {
    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const phone = document.getElementById("user-phone").value.trim();

    // 🔥 VALIDATION SECTION ---------------------

    // Name validation (letters + spaces only)
    const nameRegex = /^[A-Za-z ]{2,}$/;
    if (!nameRegex.test(name)) {
      alert("Name should contain only letters and spaces (min 2 characters).");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Phone validation (only if entered)
    if (phone.trim() !== "") {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        alert(
          "Enter a valid Indian mobile number starting with 6,7,8,9 (10 digits)."
        );
        return;
      }
    }

    // -------------------------------------------

    this.userName = name;
    this.userEmail = email;
    this.userPhone = phone;

    localStorage.setItem("chatbot_user_name", name);
    localStorage.setItem("chatbot_user_email", email);
    localStorage.setItem("chatbot_user_phone", phone);

    document.getElementById("chatbot-user-info").style.display = "none";
    this.showChatInterface();
    this.addBotMessage(`Hello ${name}! 👋 How can I help you today?`);
    this.showQuickReplies();
  }

  showChatInterface() {
    document.getElementById("chatbot-user-info").style.display = "none";
  }

  showQuickReplies() {
    const quickReplies = [
      "Our Services",
      "AI Solutions",
      "Contact Info",
      "Get a Quote",
    ];

    const repliesHTML = `
            <div class="quick-replies" id="quick-replies">
                ${quickReplies
                  .map(
                    (reply) =>
                      `<button class="quick-reply-btn" onclick="chatbot.sendQuickReply('${reply}')">${reply}</button>`
                  )
                  .join("")}
            </div>
        `;

    document
      .getElementById("chatbot-messages")
      .insertAdjacentHTML("beforeend", repliesHTML);

    this.scrollToBottom();
  }

  sendQuickReply(message) {
    document.querySelectorAll(".quick-replies").forEach((el) => el.remove());
    this.sendMessage(message);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("chatbot-input");
    const message = input.value.trim();

    if (!message || this.isTyping) return;

    input.value = "";
    this.sendMessage(message);
  }

  async sendMessage(message) {
    this.addUserMessage(message);
    this.showTyping();

    try {
      const response = await fetch(
        "https://zonixtec.com/server/chatbot/chatbot-send-message.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: this.sessionId,
            user_name: this.userName,
            user_email: this.userEmail,
            user_phone: this.userPhone,
            message: message,
          }),
        }
      );

      const data = await response.json();

      setTimeout(() => {
        this.hideTyping();
        if (data.success && data.response) {
          this.addBotMessage(data.response);
        } else {
          this.addBotMessage(
            "I'm sorry, I couldn't process that. Please try again."
          );
        }
      }, 800);
    } catch (error) {
      console.error("Chatbot error:", error);
      this.hideTyping();
      this.addBotMessage(
        "Sorry, I'm having trouble connecting. Please try again later."
      );
    }
  }

  addUserMessage(message) {
    const html = `
            <div class="chat-message user">
                <div class="message-avatar"><i class="fas fa-user"></i></div>
                <div class="message-wrapper">
                    <div class="message-content">${this.escapeHtml(
                      message
                    )}</div>
                    <div class="message-time">${this.getCurrentTime()}</div>
                </div>
            </div>
        `;
    document
      .getElementById("chatbot-messages")
      .insertAdjacentHTML("beforeend", html);
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const html = `
            <div class="chat-message bot">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-wrapper">
                    <div class="message-content">${this.formatMessage(
                      message
                    )}</div>
                    <div class="message-time">${this.getCurrentTime()}</div>
                </div>
            </div>
        `;
    document
      .getElementById("chatbot-messages")
      .insertAdjacentHTML("beforeend", html);
    this.scrollToBottom();
  }

  showTyping() {
    this.isTyping = true;
    const html = `
            <div class="chat-message bot" id="typing-indicator">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-wrapper">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
    document
      .getElementById("chatbot-messages")
      .insertAdjacentHTML("beforeend", html);
    this.scrollToBottom();
  }

  hideTyping() {
    this.isTyping = false;
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  scrollToBottom() {
    const box = document.getElementById("chatbot-messages");
    box.scrollTop = box.scrollHeight;
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  escapeHtml(text) {
    return text.replace(/[&<>"']/g, (m) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return map[m];
    });
  }

  formatMessage(text) {
    let formatted = this.escapeHtml(text);
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  }
}

// Initialize chatbot
let chatbot;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    chatbot = new ZonixtecChatbot();
  });
} else {
  chatbot = new ZonixtecChatbot();
}
