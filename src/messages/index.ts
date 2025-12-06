import {PuzzleId} from '../models/common.js';
import {IRace, Storm} from '../models/index.js';

export enum MessageTypes {
  puzzle_race_finished = 'puzzle_race_finished',
  puzzle_storm_finished = 'puzzle_storm_finished',
  puzzle_solved_single = 'puzzle_solved_single',
  debug_script = 'debug_script',
  close_tab = 'close_tab',
}

export interface MessageMap {
  [MessageTypes.puzzle_race_finished]: IRace;
  [MessageTypes.puzzle_storm_finished]: Storm;
  [MessageTypes.puzzle_solved_single]: {id: PuzzleId};
  [MessageTypes.debug_script]: {text: string};
  [MessageTypes.close_tab]: {};
}

export type MessageType = keyof MessageMap;
export type RuntimeMessage<T extends MessageType = MessageType> = {type: T} & MessageMap[T];

export type PuzzleRaceFinishedMessage = RuntimeMessage<MessageTypes.puzzle_race_finished>;
export type PuzzleStormFinishedMessage = RuntimeMessage<MessageTypes.puzzle_storm_finished>;
export type PuzzleSolvedMessage = RuntimeMessage<MessageTypes.puzzle_solved_single>;
export type DebugMessage = RuntimeMessage<MessageTypes.debug_script>;
