
const messageWrapper = document.getElementById('messageWrapper');
const chatForm = document.getElementById('messageForm');
const chatInput = document.getElementById('chatInput');
const themeToggle = document.getElementById('themeToggle');
const clearChat = document.getElementById('clearChat');
const typingIndicator = document.getElementById('typingIndicator');
const voiceButton = document.getElementById('voiceButton');

const LOCAL_STORAGE_KEY = 'ruleBasedChatbotHistory';
const THEME_STORAGE_KEY = 'ruleBasedChatbotTheme';
let isBotTyping = false;

// Load saved chat history and theme when the page opens.
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadHistory();
  showWelcomeMessage();
});

// Submit message when user clicks send or presses Enter.
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleUserMessage();
});

// Toggle between light and dark mode.
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const activeTheme = document.body.classList.contains('light') ? 'light' : 'dark';
  themeToggle.textContent = activeTheme === 'light' ? 'Light mode' : 'Dark mode';
  localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
});

// Clear chat history and reset the conversation.
clearChat.addEventListener('click', () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  messageWrapper.innerHTML = '';
  showWelcomeMessage();
});

// Optional voice input support for browsers that support SpeechRecognition.
voiceButton.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in this browser.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  voiceButton.textContent = '🎧';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript;
    handleUserMessage();
  };

  recognition.onerror = () => {
    voiceButton.textContent = '🎙️';
  };

  recognition.onend = () => {
    voiceButton.textContent = '🎙️';
  };
});

// Display a welcome message on initial load.
function showWelcomeMessage() {
  if (messageWrapper.children.length === 0) {
    addMessage('Hello! I am your rule-based AI assistant. Try asking me a question.', 'bot');
  }
}

// Handle the user message and trigger the bot response.
function handleUserMessage() {
  const userText = chatInput.value.trim();
  if (!userText || isBotTyping) {
    return;
  }

  addMessage(userText, 'user');
  chatInput.value = '';
  saveHistory();
  showTypingIndicator();

  setTimeout(() => {
    const botText = getBotResponse(userText.toLowerCase());
    hideTypingIndicator();
    addMessage(botText, 'bot');
    saveHistory();
  }, 900);
}


function getBotResponse(message) {
  const cleanedMessage = message.toLowerCase();

  if (cleanedMessage.includes('hello') || cleanedMessage.includes('hi')) {
    return 'Hi there! I am ready to help you. 😊';
  }

  if (cleanedMessage.includes('how are you')) {
    return 'I am doing well, thank you! How can I assist you today?';
  }

  if (cleanedMessage.includes('your name')) {
    return 'I am the Rule-Based AI Chatbot. You can call me ChatAssistant.';
  }

  if (cleanedMessage.includes('what can you do')) {
    return 'I can answer a few questions, tell jokes, show the current time, and respond quickly to simple prompts.';
  }

  if (cleanedMessage.includes('tell me a joke')) {
    return 'Sure! Why did the robot go on vacation? Because it needed to recharge its batteries. 😄';
  }

  if (cleanedMessage.includes('time')) {
    return `The current time is ${getCurrentTime()}.`; 
  }

  if (cleanedMessage.includes('bye') || cleanedMessage.includes('goodbye')) {
    return 'Goodbye! Feel free to message me again anytime.';
  } 

  return 'Sorry, I don’t understand. Please try another phrase.';
}

// Build and show a chat message bubble.
function addMessage(text, sender) {
  const messageItem = document.createElement('article');
  messageItem.classList.add('message-item', sender);

  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.textContent = sender === 'bot' ? '🤖' : '🧑';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;

  const meta = document.createElement('div');
  meta.classList.add('message-meta');
  meta.textContent = getTimeStamp();

  const bubbleContainer = document.createElement('div');
  bubbleContainer.appendChild(bubble);
  bubbleContainer.appendChild(meta);

  if (sender === 'bot') {
    messageItem.append(avatar, bubbleContainer);
  } else {
    messageItem.append(bubbleContainer, avatar);
  }

  messageWrapper.appendChild(messageItem);
  messageWrapper.scrollTop = messageWrapper.scrollHeight;
}

// Show the typing indicator for the bot.
function showTypingIndicator() {
  isBotTyping = true;
  typingIndicator.classList.add('active');
}

// Hide the typing indicator.
function hideTypingIndicator() {
  isBotTyping = false;
  typingIndicator.classList.remove('active');
}

// Get a nicely formatted timestamp for messages.
function getTimeStamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Return current system time in a friendly format.
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Save the current chat history to localStorage.
function saveHistory() {
  const messages = Array.from(messageWrapper.children).map((messageItem) => {
    const bubble = messageItem.querySelector('.bubble');
    const meta = messageItem.querySelector('.message-meta');
    return {
      sender: messageItem.classList.contains('bot') ? 'bot' : 'user',
      text: bubble.textContent,
      time: meta.textContent,
    };
  });

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
}

// Load saved chat history from localStorage.
function loadHistory() {
  const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savedHistory) {
    return;
  }

  const messages = JSON.parse(savedHistory);
  messages.forEach((item) => {
    const messageItem = document.createElement('article');
    messageItem.classList.add('message-item', item.sender);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = item.sender === 'bot' ? '🤖' : '🧑';

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = item.text;

    const meta = document.createElement('div');
    meta.classList.add('message-meta');
    meta.textContent = item.time;

    const bubbleContainer = document.createElement('div');
    bubbleContainer.appendChild(bubble);
    bubbleContainer.appendChild(meta);

    if (item.sender === 'bot') {
      messageItem.append(avatar, bubbleContainer);
    } else {
      messageItem.append(bubbleContainer, avatar);
    }

    messageWrapper.appendChild(messageItem);
  });

  if (messages.length > 0) {
    messageWrapper.scrollTop = messageWrapper.scrollHeight;
  }
}

// Load the selected theme from localStorage.
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = 'Light mode';
  } else {
    document.body.classList.remove('light');
    themeToggle.textContent = 'Dark mode';
  }
}
