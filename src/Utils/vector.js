function vecScale(vec, factor) {
    let result = {};
    for(let component in vec) {
        result[component] = vec[component] * factor;
    }
    return result;
}

function vecRotate(vec, amount) {
    return {
        x: Math.cos(amount) * vec.x - Math.sin(amount) * vec.y,
        y: Math.sin(amount) * vec.x + Math.cos(amount) * vec.y
    };
}

function vecLength(vec) {
    let sum = 0;
    for(let component in vec) {
        sum += vec[component] * vec[component];
    }
    return Math.sqrt(sum);
}

function vecNormalize(vec) {
    let length = vecLength(vec);
    if(length == 0) return vec;
    return vecScale(vec, 1 / length);
}

function vecAdd(v1, v2) {
    let result = {};
    for (let component in v1) {
        result[component] = v1[component] + v2[component];
    }
    return result;
}

function vecSubtract(v1, v2) {
    let result = {};
    for(let component in v1) {
        result[component] = v1[component] - v2[component];
    }
    return result;
}

function vecLerp(v1, v2, t) {
    let result = {};
    for(let component in v1) {
        result[component] = v1[component] * (1 - t) + v2[component] * t;
    }
    return result;
}

function vecDot(v1, v2) {
    let result = 0;
    for(let component in v1) {
        result += v1[component] * v2[component];
    }
    return result;
}

function vecCross(v1, v2) {
    let result = {};
    result.x = v1.y * v2.z - v1.z * v2.y;
    result.y = v1.z * v2.x - v1.x * v2.z;
    result.z = v1.x * v2.y - v1.y * v2.x;
    return result;
}