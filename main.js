let socket = null;
let isConnected = false;

const connectBtn = document.getElementById('connect-btn');
const connectionStatus = document.getElementById('connection-status');
const logContent = document.getElementById('log-content');
const gameIdInput = document.getElementById('game-id');
const playerIdInput = document.getElementById('player-id');

let curX = 0;
let curY = 0;

// Game Controls
function socketEmit(event, payload) {
  if (!isConnected) {
    addLog('Not connected to server');
    return;
  }

  addLog('Using socket:', event, payload);

  socket.emit(event, payload);
}

function action(action, payload = {}, isChild = false) {
  if (isChild) {
    socketEmit('action', { action, payload, characterType: 'child' });
  } else {
    socketEmit('action', { action, payload });
  }
}

function drive(direction, isChild = false) {
  if (isChild) {
    socketEmit('drive player', { direction, characterType: 'child' });
  } else {
    socketEmit('drive player', { direction });
  }
}

function registerCharacterPower(type) {
  socketEmit('register character power', { type });
}

function updateConnectionStatus(connected) {
  connectionStatus.textContent = connected ? 'Connected' : 'Disconnected';
  connectionStatus.className = `status ${
    connected ? 'connected' : 'disconnected'
  }`;
}

function addLog(message, isUpdate = false) {
  if (isUpdate) {
    const lastLog = logContent.lastElementChild;
    if (lastLog && lastLog.textContent.includes('Game state updated')) {
      lastLog.textContent = `Game state updated (${new Date().toLocaleTimeString()})`;
      return;
    }
  }

  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContent.appendChild(logEntry);
  logContent.scrollTop = logContent.scrollHeight;
}

connectBtn.addEventListener('click', () => {
  if (!gameIdInput.value || !playerIdInput.value) {
    addLog('Please enter both Game ID and Player ID');
    return;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io('http://localhost', {
    reconnect: true,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    isConnected = true;
    updateConnectionStatus(true);
    addLog('Connected to server');

    // Join game
    console.log(gameIdInput.value);
    console.log(playerIdInput.value);
    socket.emit('join game', {
      game_id: gameIdInput.value,
      player_id: playerIdInput.value,
    });
  });

  socket.on('disconnect', () => {
    isConnected = false;
    updateConnectionStatus(false);
    addLog('Disconnected from server');
  });

  socket.on('join game', (response) => {
    addLog('Joined game: ' + JSON.stringify(response));
  });

  socket.on('ticktack player', (response) => {
    console.log(response.map_info.player[0].currentPosition);
    addLog('Game state updated', response.map_info.player[0].currentPosition);
    addLog('Game state updated', true);
  });
});

// Keyboard Controls
const keyMap = {
  w: 'btn-up',
  s: 'btn-down',
  a: 'btn-left',
  d: 'btn-right',
  q: 'btn-weapon',
  e: 'btn-special',
  m: 'btn-marry',
  b: 'btn-b',
  x: 'btn-x',
  h: 'btn-h',
};

document.addEventListener('keydown', (event) => {
  const buttonId = keyMap[event.key.toLowerCase()];
  if (buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.click();
      button.classList.add('active');
    }
  }
});

document.addEventListener('keyup', (event) => {
  const buttonId = keyMap[event.key.toLowerCase()];
  if (buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.remove('active');
    }
  }
});

// Button Controls with socket emit for drive
document.getElementById('btn-up').addEventListener('click', () => {
  drive('3');
});

document.getElementById('btn-down').addEventListener('click', () => {
  drive('4');
});

document.getElementById('btn-left').addEventListener('click', () => {
  drive('1');
});

document.getElementById('btn-right').addEventListener('click', () => {
  drive('2');
});

document.getElementById('btn-x').addEventListener('click', () => {
  drive('x');
});

document.getElementById('btn-b').addEventListener('click', () => {
  drive('b');
});

document.getElementById('i').addEventListener('click', () => {
  drive('3', (isChild = true));
});

document.getElementById('j').addEventListener('click', () => {
  drive('1', (isChild = true));
});

document.getElementById('k').addEventListener('click', () => {
  drive('4', (isChild = true));
});

document.getElementById('l').addEventListener('click', () => {
  drive('2', (isChild = true));
});

document.getElementById('g').addEventListener('click', () => {
  drive('b', (isChild = true));
});

document.getElementById('y').addEventListener('click', () => {
  action('switch weapon', (isChild = true));
});

document.getElementById('btn-h').addEventListener('click', () => {
  let typeC = document.getElementById('typeC');
  registerCharacterPower(typeC.value);
});

// Button Controls
document.getElementById('btn-weapon').addEventListener('click', () => {
  action('switch weapon');
});

document.getElementById('btn-special').addEventListener('click', () => {
  let dx = document.getElementById('dx');
  let dy = document.getElementById('dy');
  action('use weapon', {
    destination: {
      x: dx.value,
      y: dy.value,
    },
  });
});

document.getElementById('btn-marry').addEventListener('click', () => {
  action('marry wife');
});

// Utility Functions
