export interface DataPacket {
    data: {}
    type: 'REQUEST' | 'RESPONSE';
    action: 'PUT' | 'BINGO' | 'GET_CARD' | 'GET_PLAYERS' | null;
    success: boolean;
}

export interface CardDataPacket extends DataPacket {
    data: { player_id: string, game_id: string, card: number[][] };
}

export interface PlayersDataPacket extends DataPacket {
    data: { players: string[] };
}

export interface PutDataPacket extends DataPacket {
    data: { player_id: string, game_id: string, coord_x: number, coord_y: number };
}

export interface BingoDataPacket extends DataPacket {
    data: { player_id: string, game_id: string };
}

export interface StartDataPacket extends DataPacket {
    data: { player_id: string, game_id: string };
}