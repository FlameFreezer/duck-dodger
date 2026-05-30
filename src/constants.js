const DEBUG = true;

const T_PATTERN_MOVE_SPEED = 400; // px/sec

const RING_PATTERN_RINGS = 4; // number of bullet rings per attack pattern
const RING_PATTERN_BULLETS = 18; // number of bullets per ring
const RING_PATTERN_COLOR_SEGMENT_LENGTH = 3; // number of bullets per color segment
const RING_PATTERN_COLOR_SEGMENT_GAP = 1; // number of color segments between each non-gray segment
const RING_PATTERN_MOVE_SPEED = 40; // px/sec
const RING_PATTERN_GROWTH_RATE = 160; // radius growth rate in px/sec
const RING_PATTERN_MAX_ANGULAR_SPEED = Math.PI / 3; // max ring radial speed in radians/sec
const RING_PATTERN_ROTATION_SPEED = 240; // rotation around ring circumference in px/sec

const WALL_PATTERN_MOVE_PERIOD = 2000; // ms

const Colors = Object.freeze({
    YELLOW: 0,
    GREEN: 1,
    GRAY: 2
});

const DuckTypes = Object.freeze({
    RUBBER_DUCKY: 0,
    MALLARD: 1,
    GOOSE: 2
});
