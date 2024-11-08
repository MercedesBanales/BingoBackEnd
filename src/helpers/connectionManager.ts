
let connections: { socket: WebSocket; player_id: string, game_id: string }[] = [];

export const connect = (socket: WebSocket, player_id: string, game_id: string) => {
    connections.push({ socket, player_id, game_id });
    console.log(`Player ${player_id} connected to game ${game_id}`);
}

export const disconnect = (socket: WebSocket) => {
    connections = connections.filter(connection => connection.socket !== socket);
}

export const getConnections = () => {
    return connections;
}
