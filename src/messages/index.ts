import {PuzzleId} from '../models/common.js';
import {IRace, IStorm} from '../models/index.js';

export enum MessageTypes {
  // Race
  get_race_runs = 'get_race_runs',
  puzzle_race_finished = 'puzzle_race_finished',
  // Storm
  get_storm_runs = 'get_storm_runs',
  puzzle_storm_finished = 'puzzle_storm_finished',
  // Training
  puzzle_solved_single = 'puzzle_solved_single',
  // Other
  debug_script = 'debug_script',
  close_tab = 'close_tab',
}

export interface MessageMap {
  // Race
  [MessageTypes.get_race_runs]: IRace;
  [MessageTypes.puzzle_race_finished]: IRace;
  // Storm
  [MessageTypes.get_storm_runs]: IStorm;
  [MessageTypes.puzzle_storm_finished]: IStorm;
  // Training
  [MessageTypes.puzzle_solved_single]: {id: PuzzleId};
  // Other
  [MessageTypes.debug_script]: {text: string};
  [MessageTypes.close_tab]: {};
}

export type MessageType = keyof MessageMap;
export type RuntimeMessage<T extends MessageType = MessageType> = {type: T} & MessageMap[T];

// ==== Concrete message types ====
// Race
export type GetRaceRunsMessage = RuntimeMessage<MessageTypes.get_race_runs>;
export type PuzzleRaceFinishedMessage = RuntimeMessage<MessageTypes.puzzle_race_finished>;
// Storm
export type GetStormRunsMessage = RuntimeMessage<MessageTypes.get_storm_runs>;
export type PuzzleStormFinishedMessage = RuntimeMessage<MessageTypes.puzzle_storm_finished>;
// Training
export type PuzzleSolvedMessage = RuntimeMessage<MessageTypes.puzzle_solved_single>;
// Other
export type DebugMessage = RuntimeMessage<MessageTypes.debug_script>;
