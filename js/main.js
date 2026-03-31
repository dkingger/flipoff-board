import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { KeyboardController } from './KeyboardController.js';
import { MESSAGE_INTERVAL, TOTAL_TRANSITION } from './constants.js';

function toBoardMessage(text) {
  const cleaned = (text || '').trim().toUpperCase();
  if (!cleaned) return null;

  const maxLineLength = 20;
  const maxLines = 5;

  const forcedLines = cleaned.split('|').map(line => line.trim());
  const lines = [];

  for (const forcedLine of forcedLines) {
    if (!forcedLine) {
      lines.push('');
      if (lines.length >= maxLines) break;
      continue;
    }

    const words = forcedLine.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        if (word.length <= maxLineLength) {
          currentLine = word;
        } else {
          lines.push(word.slice(0, maxLineLength));
        }
        continue;
      }

      const candidate = currentLine + ' ' + word;
      if (candidate.length <= maxLineLength) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word.length <= maxLineLength ? word : word.slice(0, maxLineLength);
      }

      if (lines.length >= maxLines) break;
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    if (lines.length >= maxLines) break;
  }

  while (lines.length < maxLines) {
    lines.push('');
  }

  return lines.slice(0, maxLines);
}

async function getMessagesFromServer() {
  try {
    const response = await fetch('/api/messages', { cache: 'no-store' });
    const data = await response.json();

    if (!Array.isArray(data.messages)) return null;

    const messages = data.messages
      .map(toBoardMessage)
      .filter(Boolean);

    return messages.length ? messages : null;
  } catch {
    return null;
  }
}

function messagesAreEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

class CustomMessageRotator {
  constructor(board, messages) {
    this.board = board;
    this.messages = messages;
    this.currentIndex = -1;
    this._timer = null;
    this._paused = false;
  }

  start() {
    this.next();
    this._timer = setInterval(() => {
      if (!this._paused && !this.board.isTransitioning) {
        this.next();
      }
    }, MESSAGE_INTERVAL + TOTAL_TRANSITION);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.messages.length;
    this.board.displayMessage(this.messages[this.currentIndex]);
    this._resetAutoRotation();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.messages.length) % this.messages.length;
    this.board.displayMessage(this.messages[this.currentIndex]);
    this._resetAutoRotation();
  }

  setMessages(messages) {
    if (!Array.isArray(messages) || !messages.length) return;
    this.messages = messages;
    this.currentIndex = -1;
    this.next();
  }

  _resetAutoRotation() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = setInterval(() => {
        if (!this._paused && !this.board.isTransitioning) {
          this.next();
        }
      }, MESSAGE_INTERVAL + TOTAL_TRANSITION);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const boardContainer = document.getElementById('board-container');
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);

  const fallbackMessages = [
    ['', '', 'VELKOMMEN', '', ''],
    ['', '', 'FLIPOFF TAVLE', '', ''],
    ['', 'ÅBN ADMIN', 'NEDERST TIL HØJRE', '', ''],
  ];

  let activeMessages = fallbackMessages;
  const serverMessages = await getMessagesFromServer();
  if (serverMessages && serverMessages.length) {
    activeMessages = serverMessages;
  }

  const rotator = new CustomMessageRotator(board, activeMessages);

  new KeyboardController(rotator, soundEngine);

  let audioInitialized = false;
  const initAudio = async () => {
    if (audioInitialized) return;
    audioInitialized = true;
    await soundEngine.init();
    soundEngine.resume();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };

  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  rotator.start();

  document.querySelectorAll('.keyboard-hint, .shortcuts-overlay').forEach((el) => {
    el.remove();
  });

  setInterval(async () => {
    const latestMessages = await getMessagesFromServer();
    const nextMessages = (latestMessages && latestMessages.length) ? latestMessages : fallbackMessages;

    if (!messagesAreEqual(nextMessages, rotator.messages)) {
      rotator.setMessages(nextMessages);
    }
  }, 5000);
});
