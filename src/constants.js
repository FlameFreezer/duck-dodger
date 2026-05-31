const DEBUG = true;

const T_PATTERN_MOVE_SPEED = 400; // px/sec
const T_PATTERN_BULLET_GAP = 4; // gap between bullet centerpoints, in bullet radii

const RING_PATTERN_RINGS = 4; // number of bullet rings per attack pattern
const RING_PATTERN_RING_GAP = 8; // gap between rings at bottommost points, in bullet radii
const RING_PATTERN_BULLETS = 18; // number of bullets per ring
const RING_PATTERN_COLOR_SEGMENT_LENGTH = 3; // number of bullets per color segment
const RING_PATTERN_COLOR_SEGMENT_GAP = 1; // number of color segments between each non-gray segment
const RING_PATTERN_MOVE_SPEED = 40; // px/sec
const RING_PATTERN_GROWTH_RATE = 200; // radius growth rate in px/sec
const RING_PATTERN_MAX_ANGULAR_SPEED = Math.PI / 3; // max ring radial speed in radians/sec
const RING_PATTERN_ROTATION_SPEED = 240; // rotation around ring circumference in px/sec

const WALL_PATTERN_WALLS = 4;
const WALL_PATTERN_WARNING_TIME = 2000; // ms
const WALL_PATTERN_EXTEND_TIME = 300; // ms
const WALL_PATTERN_BULLET_GAP = 3; // gap between bullet centerpoints, in bullet radii
const WALL_PATTERN_HOLE_WIDTH = 2; // number of colored bullets per colored bullet segment
const WALL_PATTERN_HOLE_SPACING = 6; // number of gray bullets between each colored bullet segment
const WALL_PATTERN_MOVE_PERIOD = 2000; // ms
const WALL_PATTERN_LIFETIME = 8000; // ms

const PLAYER_BULLET_SPEED = 1300;
const PLAYER_FIRE_RATE = 300;
const PLAYER_BASE_SPEED = 400;
const PLAYER_SLOW_SPEED = 250;

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
