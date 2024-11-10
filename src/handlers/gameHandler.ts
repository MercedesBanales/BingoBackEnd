import { NotFoundException } from "../validators/exceptions/notFoundException";
import * as gameHandler from './gameHandler';
import * as connectionManager from '../helpers/connectionManager';
import { UserDTO } from "../utils/DTOs/userDTO";

interface ActiveGame {
    game_id: string,
    players: UserDTO[],
    bingo_sequence: string[],
}

let activeGames: ActiveGame[] = [];

export const createGame = async (game_id: string) : Promise<void> => {
    const players = await connectionManager.getGamePlayers(game_id);
    activeGames.push({ game_id, players: players, bingo_sequence: [] });
}

export const removePlayer = (game_id: string, player_id: string) : void => {
    const game: ActiveGame | undefined = activeGames.find(game => game.game_id === game_id);
    if (!game) throw new NotFoundException('Game not found');
    game.players = game.players.filter(player => player.id !== player_id);
}

export const removeGame = (game_id: string) : void => {
    activeGames = activeGames.filter(game => game.game_id !== game_id);
}

export const generateRandomNumber = (game_id: string) : string[] => {
    const game: ActiveGame | undefined = activeGames.find(game => game.game_id === game_id);
    if (!game) throw new NotFoundException('Game not found');
    const issuedNumbers = game.bingo_sequence;
    let number;
    let letter;

    do {
        number = Math.floor(Math.random() * 75) + 1;
        if (number <= 15) {
            letter = 'B';
        } else if (number <= 30) {
            letter = 'I';
        } else if (number <= 45) {
            letter = 'N';
        } else if (number <= 60) {
            letter = 'G';
        } else {
            letter = 'O';
        }
    } while (issuedNumbers.includes(`${letter}${number}`));

    const bingoEntry = `${letter}${number}`;
    game.bingo_sequence = [...issuedNumbers, bingoEntry];
    return game.bingo_sequence;
};


export const startGameWithRandomNumbers = (game_id: string) => {
    const await = createGame(game_id);
    const interval_id = setInterval(() => {
        if (!connectionManager.find(game_id)) {
            clearInterval(interval_id);
        } else {
            const sequence = generateRandomNumber(game_id);
            connectionManager.broadcast(game_id, 'SEQ', '', true, sequence);
        }

    }, 5000);
};

export const getSequence = (game_id: string) : string[] => {
    const game: ActiveGame | undefined = activeGames.find(game => game.game_id === game_id);
    if (!game) throw new NotFoundException('Game not found');
    return game.bingo_sequence;
}
