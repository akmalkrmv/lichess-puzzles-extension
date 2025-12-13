export var MessageTypes;
(function (MessageTypes) {
    // Race
    MessageTypes["get_race_runs"] = "get_race_runs";
    MessageTypes["puzzle_race_finished"] = "puzzle_race_finished";
    // Storm
    MessageTypes["get_storm_runs"] = "get_storm_runs";
    MessageTypes["puzzle_storm_finished"] = "puzzle_storm_finished";
    // Training
    MessageTypes["puzzle_solved_single"] = "puzzle_solved_single";
    // Other
    MessageTypes["debug_script"] = "debug_script";
    MessageTypes["close_tab"] = "close_tab";
})(MessageTypes || (MessageTypes = {}));
