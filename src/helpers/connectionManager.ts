export interface Connection {
    socket: WebSocket;
    player_id: string;
    game_room: number;
}

let connections: Connection[] = [];

export const connect = (socket: WebSocket, player_id: string, game_room: number) : void => {
    connections.push({ socket, player_id, game_room });
    socket.send(`Welcome Player ${player_id} to game room ${game_room}`);
}

export const disconnect = (socket: WebSocket) : void => {
    connections = connections.filter(connection => connection.socket !== socket);
}

export const getConnectionsByGameRoom = (game_room: number) : Connection[] => {
    return connections.filter(connection => connection.game_room === game_room);
}

export const send = (player_id: string, message: string) : void=> {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) connection.socket.send(message);
}

export const broadcast = (game_room: number, message: string) : void => {
    const connectionsInRoom = getConnectionsByGameRoom(game_room);
    connectionsInRoom.forEach(connection => send(connection.player_id, message));
}

export const disconnectAll = (game_room: number) : void=> {
    const connectionsInRoom = getConnectionsByGameRoom(game_room);
    connectionsInRoom.forEach(connection => connection.socket.close());
}
