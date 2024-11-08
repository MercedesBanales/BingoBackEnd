import { DataPacket } from "../utils/interfaces/DataPacket";

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

export const send = (player_id: string,  success: boolean, message?: string) : void=> {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) {
        const data = JSON.stringify({ data: { message }, 
            type: 'RESPONSE', 
            action: null,
            success: success});
        connection.socket.send(data);
    }
}

export const broadcast = (game_room: number, message: string, success: boolean) : void => {
    const connectionsInRoom = getConnectionsByGameRoom(game_room);
    connectionsInRoom.forEach(connection => send(connection.player_id, success, message));
}

export const disconnectAll = (game_room: number) : void=> {
    const connectionsInRoom = getConnectionsByGameRoom(game_room);
    connectionsInRoom.forEach(connection => connection.socket.close());
}
