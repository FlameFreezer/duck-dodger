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
    return vecScale(vec, 1 / length);
}