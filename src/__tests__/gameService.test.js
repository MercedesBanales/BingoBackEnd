import * as gameService from './gameService';
import * as gamesRepository from '../dataAccess/repositories/gamesRepository';
import * as cardsService from './cardsService';
import * as usersService from './userService';
import { StatusType } from './gameService';

jest.mock('../dataAccess/repositories/gamesRepository');
jest.mock('./cardsService');
jest.mock('./userService');
