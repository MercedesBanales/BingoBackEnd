export interface DataPacket {
    data: { coord_x: number, coord_y: number, game_id: string } 
    | { message: string | null, game_id: string | null};
    type: 'REQUEST' | 'RESPONSE';
    action: 'PUT' | 'BINGO' | null;
    success: boolean;
}