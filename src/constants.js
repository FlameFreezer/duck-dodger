const DEBUG = false;

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

const WALL_PATTERN_WALLS = 4; // number of walls per attack pattern
const WALL_PATTERN_WARNING_TIME = 2000; // ms
const WALL_PATTERN_EXTEND_TIME = 300; // ms
const WALL_PATTERN_BULLET_GAP = 3; // gap between bullet centerpoints, in bullet radii
const WALL_PATTERN_HOLE_WIDTH = 3; // number of colored bullets per colored bullet segment
const WALL_PATTERN_HOLE_SPACING = 5; // number of gray bullets between each colored bullet segment
const WALL_PATTERN_MOVE_PERIOD = 2000; // ms
const WALL_PATTERN_LIFETIME = 8000; // ms

const PLAYER_BULLET_SPEED = 1300; // speed of the player bullets (px/s)
const PLAYER_FIRE_RATE = 300; //delay between player shots before mods applied (ms)
const PLAYER_BASE_SPEED = 400; //player speed when not shifting (px/s)
const PLAYER_SLOW_SPEED = 250; //player speed when holding shift (px/s)
const PLAYER_FIRE_RATE_PER_LEVEL = 25; //fire rate to subtract from delay per level of upgrade (ms)
const PLAYER_MAX_FIRE_RATE = 50; //min delay between player shots (ms)
const PLAYER_BULLET_SPACING = 15; //space between player bullets when player has multiple projectiles (px)
const PLAYER_BULLET_ROTATION_RATE = 2; //rate player bullets rotate towards targets when homing (radians/s)
const PLAYER_BULLET_BASE_HOMING_REGION_WIDTH = 25; //initial width of the bullet homing region (px)
const PLAYER_BULLET_BASE_HOMING_REGION_HEIGHT = 50; //initial height of the bullet homing region (px)
const PLAYER_BULLET_HOMING_REGION_SIZE_PER_LEVEL = 25; //amount to increase both bullet homing region dimensions by per level (px)
const PLAYER_BULLET_HOMING_ANGLE_PER_LEVEL = 0.15; //amount to increase homing rotation amount by per level (radians)
const PLAYER_HIT_FRAME_TIME = 400;
const COLOR_CHANGE_TIME = 100;

const DEATH_ANIM_TIME = 750; // how long the death animation takes to play, in ms

const canvasW = 600;
const canvasH = 950;
const healthUpInterval = 500;
const heartGrowMaximum = 1.2;
const heartGrowTime = 200;

const BUBBLE_RATE = 750;
const BUBBLE_SIZE_RANGE = Object.freeze({
    MIN: 0.35,
    MAX: 0.75
});

const Colors = Object.freeze({
    YELLOW: 0,
    GREEN: 1,
    GRAY: 2
});

const GetRGBFromColor = (color) => {
    switch(color) {
        case Colors.YELLOW:
            return {r: 255, g: 213, b: 0};
        case Colors.GREEN:
            return {r: 5, g: 179, b: 20};
        default: // this should never happen
            console.log("GetRGBFromColor: the requested color (" + color + ") does not exist.");
            break;
    }
}

const DuckTypes = Object.freeze({
    RUBBER_DUCKY: 0,
    MALLARD: 1,
    GOOSE: 2
});

const spawnDataDefaults = Object.freeze({
    TIME: 0,
    SPAWN_STARTS: {y: -50},
    SPAWN_DUR: 1000
});
