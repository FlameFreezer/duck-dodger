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

function vecAngle(vec) {
    if (vec.x == 0) {
        if (vec.y > 0) {
            return Math.PI / 2;
        }
        if (vec.y < 0) {
            return 3 * Math.PI / 2;
        }
        else {
            console.log("vecAngle: The zero vector has no angle.")
            return NaN;
        }
    }
    else {
        let m = vec.y / vec.x;
        let theta = Math.atan(m);
        if (vec.x > 0) {
            if (vec.y >= 0) return theta;
            else return 2 * Math.PI + theta;
        }
        else {
            return Math.PI + theta;
        }
    }
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

// margin: int. thickness of screen border margin in pixels.
// use negative margin to allow vec to extend outside of camera bounds.
function vecInCameraBounds(scene, vec, margin = 0) {
    return (vec.x > 1 * margin && vec.x < scene.sys.scale.width - margin &&
            vec.y > margin && vec.y < scene.sys.scale.height - margin);
}

function colorToVector(color) {
    return {
        x: color.r,
        y: color.g,
        z: color.b
    };
}

function radToDeg(radians) {
    return 180 * radians / Math.PI;
}