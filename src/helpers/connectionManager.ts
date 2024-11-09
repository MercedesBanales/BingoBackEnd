import { DataPacket } from "../utils/interfaces/DataPacket";

export interface Connection {
    socket: WebSocket;
    player_id: string;
    status: 'WAITING' | 'PLAYING' | 'FINISHED';
    game_id: number | null;
}

let connections: Connection[] = [];

export const connect = (socket: WebSocket, player_id: string) : void => {
    connections.push({ socket, player_id, status: 'WAITING', game_id: null });
    socket.send(`Welcome Player ${player_id} to lobby`);
}

export const start = (game_id: string) : void => {
    const connectionsInRoom = filterConnections(connection => connection.status === 'WAITING');
    connectionsInRoom.map(connection => ({
        ...connection, 
        status: 'PLAYING', 
        game_id
    }));}

export const disconnect = (socket: WebSocket) : void => {
    connections = connections.filter(connection => connection.socket !== socket);
}

export const getPlayersInLobby = () : Connection[] => {
    return filterConnections(connection => connection.status === 'WAITING');
}

export const send = (player_id: string,  success: boolean, message?: string) : void=> {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) {
        const data = JSON.stringify({ data: { message }, 
            type: 'RESPONSE', 
            action: null,
            success: success} as DataPacket);
        connection.socket.send(data);
    }
}

export const broadcast = (game_id: string, message: string, success: boolean) : void => {
    const connectionsInRoom = filterConnections(connection => connection.game_id === parseInt(game_id));
    connectionsInRoom.forEach(connection => send(connection.player_id, success, message));
}

export const disconnectAll = () : void=> {
    const connectionsInRoom = filterConnections(connection => connection.status === 'WAITING');
    connectionsInRoom.forEach(connection => connection.socket.close());
}

const filterConnections = (condition: (connection: Connection) => boolean) : Connection[] => {
    return connections.filter(condition);
}
