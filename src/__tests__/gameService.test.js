import * as gameService from '../services/gamesService';
import * as gamesRepository from '../dataAccess/repositories/gamesRepository';
import * as cardsService from '../services/cardsService';
import * as usersService from '../services/userService';
import { StatusType } from '../services/gamesService';

jest.mock('../dataAccess/repositories/gamesRepository');
jest.mock('../services/cardsService');
jest.mock('../services/userService');

function generateMockCard() {
    const card = [];
    const ranges = [
      [1, 15],     
      [16, 30],    
      [31, 45],    
      [46, 60],    
      [61, 75]    
    ];
  
    ranges.forEach(([min, max]) => {
      const column = [];
      while (column.length < 5) { 
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!column.includes(number)) {
          column.push(number);
        }
      }
      card.push(column);
    });
  
    return card;
  }
  

describe('start', () => {
    it('should create a game and assign a card to each player', async () => {
      const mockPlayerIds = ['player1', 'player2'];
      const mockGameId = 'game123';
      
      gamesRepository.create.mockResolvedValue(mockGameId);
      cardsService.create.mockImplementation((player_id, game_id) => ({
        gameId: game_id,
        playerId: player_id,
        card: generateMockCard()
      }));
  
      const result = await gameService.start(mockPlayerIds);
  
      expect(gamesRepository.create).toHaveBeenCalledWith(mockPlayerIds);
      expect(cardsService.create).toHaveBeenCalledTimes(mockPlayerIds.length);
      expect(result).toBe(mockGameId);
    });
  });
  
