const socket = new WebSocket('wss://your-backend.onrender.com');  // Replace with your Render WebSocket URL

let square = document.getElementById('square');
let gameArea = document.getElementById('gameArea');

// Random color for the square
let squareColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
square.style.backgroundColor = squareColor;

let playerId = null;  // To identify each player's square
let currentPosition = { x: 0, y: 0 };  // To store the position of the player's square

// Wait for WebSocket connection
socket.onopen = () => {
    console.log('Connected to the server');
    socket.send(JSON.stringify({ type: 'join', color: squareColor }));
};

// Handle incoming messages from the server (other players' squares)
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'update') {
        updateSquares(data.players);
    }
};

// Update squares of other players
function updateSquares(players) {
    const allSquares = document.querySelectorAll('.playerSquare');
    allSquares.forEach(square => square.remove());  // Remove existing squares

    players.forEach(player => {
        if (player.id !== playerId) {
            let newSquare = document.createElement('div');
            newSquare.className = 'playerSquare';
            newSquare.style.backgroundColor = player.color;
            newSquare.style.width = '50px';
            newSquare.style.height = '50px';
            newSquare.style.position = 'absolute';
            newSquare.style.left = `${player.x}px`;
            newSquare.style.top = `${player.y}px`;
            gameArea.appendChild(newSquare);
        }
    });
}

// Allow the user to drag the square
square.onmousedown = (e) => {
    e.preventDefault();
    let offsetX = e.clientX - square.offsetLeft;
    let offsetY = e.clientY - square.offsetTop;

    document.onmousemove = (e) => {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Prevent square from going outside the game area
        newX = Math.max(0, Math.min(newX, gameArea.offsetWidth - square.offsetWidth));
        newY = Math.max(0, Math.min(newY, gameArea.offsetHeight - square.offsetHeight));

        square.style.left = `${newX}px`;
        square.style.top = `${newY}px`;

        // Update position for this player
        currentPosition.x = newX;
        currentPosition.y = newY;
        socket.send(JSON.stringify({ type: 'move', id: playerId, x: currentPosition.x, y: currentPosition.y }));
    };

    document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
    };
};
