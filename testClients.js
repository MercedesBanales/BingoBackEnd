const WebSocket = require('ws');
const serverUrl = 'ws://localhost:3000'; // Adjust this if your server is running on a different port

// Simulate a player connecting with a specific player_id and game_room
const createPlayerConnection = (playerId, gameRoom) => {
    const socket = new WebSocket(`ws://localhost:3000`);
    
    socket.addEventListener('open', () => {
        console.log(`Player ${playerId} connected to game room ${gameRoom}`);
        socket.send(`Hello from player ${playerId}`);
    });

    socket.addEventListener('message', (data) => {
        console.log(`Player ${playerId} received: ${data}`);
    });

    socket.addEventListener('close', () => {
        console.log(`Player ${playerId} disconnected from game room ${gameRoom}`);
    });

    socket.addEventListener('error', (err) => {
        console.error(`Error: ${err.message}`);
    });

    return socket;
};

// Simulate 3 players joining a game room
const gameRoom = 1; // Example game room number
createPlayerConnection('ad2b4e02-8720-4924-95f0-ab767ef02140', gameRoom); // Player 1
setTimeout(() => createPlayerConnection('db2577cb-8c57-4526-8488-8089fce75b3d', gameRoom), 5000); // Player 2 after 5 seconds
// setTimeout(() => createPlayerConnection(3, gameRoom), 10000); // Player 3 after 10 seconds
