import { DataPacket } from "../utils/interfaces/DataPacket";
import { NotFoundException } from "../validators/exceptions/notFoundException";
import * as gamesService from '../services/gamesService';
import { UserDTO } from "../utils/DTOs/userDTO";
import * as gameHandler from '../handlers/gameHandler';

export interface Connection {
    socket: WebSocket;
    player_id: string;
    status: 'WAITING' | 'AVAILABLE' | 'PLAYING';
    game_id: string | null;
}

let connections: Connection[] = [];
let gameStarting = false;

export const isGameStarting = (): boolean => gameStarting;
export const setGameStarting = (status: boolean): void => {
    gameStarting = status;
};


export const connect = (socket: WebSocket, player_id: string) : void => {
    connections.push({ socket, player_id, status: 'WAITING', game_id: null });
}

export const start = (game_id: string) : void => {
    connections.forEach(connection => {
        if (connection.status === 'AVAILABLE') {
            connection.status = 'PLAYING';
            connection.game_id = game_id;
            send(connection.player_id, true, '', game_id, 'Game started')
        }
    });
    gameHandler.startGameWithRandomNumbers(game_id);
}

export const disconnect = (socket: WebSocket) : void => {
    connections = connections.filter(connection => connection.socket !== socket);
}

export const getAvailablePlayersInLobby = () : Connection[] => {
    return filterConnections(connection => connection.status === 'AVAILABLE');
}

export const send = (player_id: string,  success: boolean, action?: string, game_id?: string, message?: string, card?: number[][], players?: UserDTO[], sequence?: string[]) : void=> {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) {
        const data = JSON.stringify({ data: { message: message, game_id: game_id, card: card, players: players, sequence: sequence }, 
            type: 'RESPONSE', 
            action: action, 
            success: success } as DataPacket);
        connection.socket.send(data);
    }
}

export const broadcast = (game_id: string, action: string, message: string, success: boolean, sequence?: string[]) : void => {
    const connectionsInLobby = filterConnections(connection => connection.game_id === game_id);
    connectionsInLobby.forEach(connection => send(connection.player_id, success, action, game_id, message, [[]], [], sequence));
}

export const disconnectAll = () : void=> {
    const connectionsInRoom = filterConnections(connection => connection.status === 'WAITING');
    connectionsInRoom.forEach(connection => connection.socket.close());
}

export const setAvailable = (player_id: string) : void => {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) connection.status = 'AVAILABLE';
    else throw new NotFoundException('Player not found');
}

export const getCurrentPlayer = (player_id: string) : Connection => {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) return connection;
    else throw new NotFoundException('Player not found');
}

export const getGamePlayers = async (game_id: string) : Promise<UserDTO[]> => {
    return await gamesService.getPlayers(game_id);
}

const filterConnections = (condition: (connection: Connection) => boolean) : Connection[] => {
    return connections.filter(condition);
}

export const find = (game_id: string) : boolean => {
    return connections.some(connection => connection.game_id === game_id);
}
