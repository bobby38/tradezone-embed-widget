// WIDGET-SCRIPT.JS - All functionality for the Tradezone AI Assistant
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

// --- START OF MODIFICATION ---
// Create a custom renderer for the 'marked' library
const renderer = new marked.Renderer();

// Override the 'link' function to add target="_top"
// This forces any link clicked inside the iframe to open in the main browser window.
renderer.link = (href, title, text) => {
  return `<a target="_top" href="${href}" title="${title}">${text}</a>`;
};

// Use this custom renderer when parsing markdown
marked.setOptions({ renderer });
// --- END OF MODIFICATION ---


class TradezoneWidget {
  constructor() {
    this.initializeElements();
    this.setupUserId();
    this.initializeChat();
    this.bindEvents();
    this.isChatActive = false;
    this.addMessage('Welcome to Tradezone AI Assistant!', false);
  }

  initializeElements() {
    this.playButton = document.getElementById('playButton');
    this.video = document.querySelector('.avatar-video');
    this.talkButton = document.getElementById('talkButton');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendButton');
    this.chatMessages = document.getElementById('chatMessages');
    this.thinkingIndicator = document.getElementById('thinkingIndicator');
    this.welcomeView = document.getElementById('welcomeView');
    this.chatView = document.getElementById('chatView');
    this.startCallButton = document.getElementById('startCallButton');
  }

  setupUserId() {
    this.userId = localStorage.getItem('tradezone-user-id');
    if (!this.userId) {
      this.userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('tradezone-user-id', this.userId);
    }
  }

  initializeChat() {
    try {
      this.chatInstance = createChat({
        webhookUrl: 'https://n8.getrezult.com/webhook/cf424bcc-ac90-4fd8-80b9-7292f8d61a6d/chat',
        target: '#hidden-chat-container',
        mode: 'window',
        metadata: { userId: this.userId, source: 'tradezone-widget' },
        allowFileUploads: false,
        loadPreviousSession: true,
        initialMessages: []
      });

      this.chatInstance.onSessionLoaded = (session) => {
        if (session && session.messages.length > 0) {
          this.showChatArea();
          this.chatMessages.innerHTML = '';
          session.messages.forEach(msg => {
            this.addMessage(msg.text, msg.type === 'user');
          });
        }
      };
    } catch (error) {
      console.error('Failed to initialize n8n chat library:', error);
      this.showChatArea();
    }
  }

  bindEvents() {
    this.playButton.addEventListener('click', () => this.playVideo());
    this.talkButton.addEventListener('click', () => {
        this.showChatArea();
        this.activateVoiceChat();
    });
    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.addEventListener('click', () => this.showWelcomeView());
    }
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
  }

  playVideo() {
    this.video.muted = false;
    this.video.play();
    this.playButton.style.display = 'none';
    this.video.addEventListener('pause', () => { this.playButton.style.display = 'flex'; });
    this.video.addEventListener('ended', () => { this.playButton.style.display = 'flex'; });
  }

  activateVoiceChat() {
    const existingWidget = document.querySelector('elevenlabs-convai');
    if (existingWidget && existingWidget.style.display !== 'none') return;
    if (existingWidget) existingWidget.style.display = 'block';
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;
    if (!this.isChatActive) {
      this.showChatArea();
      this.isChatActive = true;
    }
    this.addMessage(message, true);
    this.messageInput.value = '';
    this.autoResizeTextarea();
    this.showThinking();
    await this.sendMessageDirect(message);
  }

  async sendMessageDirect(message) {
    try {
      const response = await fetch('https://n8.getrezult.com/webhook/cf424bcc-ac90-4fd8-80b9-7292f8d61a6d/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: this.userId,
          chatInput: message,
          metadata: { userId: this.userId, source: 'tradezone-widget' }
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.hideThinking();
      
      let responseText = '';
      if (data && typeof data.output === 'string') responseText = data.output;
      else if (data && typeof data.text === 'string') responseText = data.text;
      else if (data && data.response && typeof data.response.text === 'string') responseText = data.response.text;

      if (responseText) {
        this.addMessage(responseText, false);
        this.speakResponse(responseText);
      } else {
        this.addMessage('Sorry, I received an unexpected response.', false);
      }
    } catch (error) {
      console.error('Direct chat error:', error);
      this.hideThinking();
      this.addMessage('Sorry, an error occurred. Please try again.', false);
    }
  }

  speakResponse(text) {
    try {
      const elevenlabsWidget = document.querySelector('elevenlabs-convai');
      if (elevenlabsWidget) {
        elevenlabsWidget.dispatchEvent(new CustomEvent('speak', { detail: { text } }));
      }
    } catch (error) {
      console.error('Error triggering speech:', error);
    }
  }

  addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? 'U' : 'AI';
    const content = document.createElement('div');
    content.className = 'message-content';
    // The 'marked' function will now use the custom renderer we defined at the top of the file
    content.innerHTML = marked.parse(text);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showChatArea() {
    if (this.welcomeView) this.welcomeView.style.display = 'none';
    if (this.chatView) this.chatView.style.display = 'flex';
    if (this.chatMessages && !this.chatMessages.classList.contains('active')) {
        this.chatMessages.classList.add('active');
    }
    const elevenLabsWidget = document.querySelector('elevenlabs-convai');
    if (elevenLabsWidget) elevenLabsWidget.style.display = 'none';
    const overlay = document.getElementById('elevenlabs-overlay');
    if (overlay) document.body.removeChild(overlay);
    this.scrollToBottom();
  }
  
  showWelcomeView() {
    if (this.chatView) this.chatView.style.display = 'none';
    if (this.welcomeView) this.welcomeView.style.display = 'flex';
  }

  showThinking() { this.thinkingIndicator.classList.add('active'); }
  hideThinking() { this.thinkingIndicator.classList.remove('active'); }
  scrollToBottom() { this.chatMessages.scrollTop = this.chatMessages.scrollHeight; }
  autoResizeTextarea() {
    this.messageInput.style.height = 'auto';
    this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
  }
}

// ElevenLabs Integration
let widgetActivationInProgress = false;

function loadElevenLabsWidget() {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="convai-widget-embed"]')) {
      resolve(); return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function activateWidget() {
  if (widgetActivationInProgress) return;
  widgetActivationInProgress = true;
  
  const elevenLabsWidget = document.querySelector('elevenlabs-convai');
  if (!elevenLabsWidget) {
    widgetActivationInProgress = false; return;
  }
  
  elevenLabsWidget.style.display = 'block';
  elevenLabsWidget.style.position = 'fixed';
  elevenLabsWidget.style.top = '50%';
  elevenLabsWidget.style.left = '50%';
  elevenLabsWidget.style.transform = 'translate(-50%, -50%)';
  elevenLabsWidget.style.zIndex = '10000';
  elevenLabsWidget.style.width = '400px';
  elevenLabsWidget.style.height = '500px';
  elevenLabsWidget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  elevenLabsWidget.style.border = 'none';
  elevenLabsWidget.style.borderRadius = '12px';
  elevenLabsWidget.style.overflow = 'hidden';

  const closeButton = document.createElement('button');
  closeButton.id = 'elevenlabs-close-button';
  closeButton.innerHTML = 'Close ×';
  Object.assign(closeButton.style, {
      position: 'absolute', top: '95px', right: '10px', zIndex: '20000',
      backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '50px',
      width: 'auto', height: '30px', fontSize: '14px', fontWeight: 'bold',
      padding: '0 15px', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center'
  });
  closeButton.addEventListener('click', closeWidget);
  setTimeout(() => { closeButton.style.display = 'flex'; }, 5000);
  
  const widgetWrapper = document.createElement('div');
  widgetWrapper.id = 'elevenlabs-widget-wrapper';
  Object.assign(widgetWrapper.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', zIndex: '10000'
  });
  document.body.appendChild(widgetWrapper);
  widgetWrapper.appendChild(elevenLabsWidget);
  widgetWrapper.appendChild(closeButton);

  const overlay = document.createElement('div');
  overlay.id = 'elevenlabs-overlay';
  Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '9999', display: 'block'
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) closeWidget(); });
  document.body.appendChild(overlay);

  setTimeout(() => {
    try {
      const shadowRoot = elevenLabsWidget.shadowRoot;
      if (shadowRoot) {
        const actualButton = shadowRoot.querySelector('button');
        if (actualButton) actualButton.click();
      }
    } catch (e) {
      console.log('Shadow DOM access failed:', e);
    }
    widgetActivationInProgress = false;
  }, 500);
}

function closeWidget() {
  const elevenLabsWidget = document.querySelector('elevenlabs-convai');
  const overlay = document.getElementById('elevenlabs-overlay');
  const widgetWrapper = document.getElementById('elevenlabs-widget-wrapper');
  if (elevenLabsWidget && widgetWrapper) {
    widgetWrapper.removeChild(elevenLabsWidget);
    document.body.appendChild(elevenLabsWidget);
    elevenLabsWidget.style.display = 'none';
  }
  if (widgetWrapper) document.body.removeChild(widgetWrapper);
  if (overlay) document.body.removeChild(overlay);
}

document.addEventListener('DOMContentLoaded', () => {
  new TradezoneWidget();
  loadElevenLabsWidget().then(() => {
    const startCallButton = document.getElementById('startCallButton');
    if (startCallButton) {
      startCallButton.addEventListener('click', activateWidget);
    }
  }).catch(error => {
    console.error('Failed to initialize ElevenLabs widget:', error);
  });
});