const WebSocket = require('ws');

// Simulate a player connecting with a specific player_id and game_room
const createPlayerConnection = (playerId, gameRoom) => {
    const socket = new WebSocket(`ws://localhost:3000/${playerId}/${gameRoom}`);
    
    socket.on('open', () => {
        console.log(`Player ${playerId} connected to game room ${gameRoom}`);
        const data = {data: {card: null, message: `Hello from player ${playerId}`}, type: "REQUEST", action: "PUT"};
        socket.send(JSON.stringify(data));
    });

    socket.on('message', (data) => {
        console.log(data.toString());
    });

    socket.on('close', () => {
        console.log(`Player ${playerId} disconnected from game room ${gameRoom}`);
    });

    socket.on('error', (err) => {
        console.error(`Error: ${err.message}`);
    });

    return socket;
};

// Simulate 3 players joining a game room
const gameRoom = 1; 
createPlayerConnection('ad2b4e02-8720-4924-95f0-ab767ef02140', gameRoom); // Player 1
setTimeout(() => createPlayerConnection('db2577cb-8c57-4526-8488-8089fce75b3d', gameRoom), 5000); // Player 2 after 5 seconds
// setTimeout(() => createPlayerConnection('ad2b4e02-8720-4924-95f0-ab767ef02140', 2), 10000); // Player 3 after 10 seconds

