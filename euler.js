// function eulerToQuaternion(alpha, beta, gamma) {
//     var cy = Math.cos(alpha * 0.5);
//     var sy = Math.sin(alpha * 0.5);
//     var cp = Math.cos(beta * 0.5);
//     var sp = Math.sin(beta * 0.5);
//     var cr = Math.cos(gamma * 0.5);
//     var sr = Math.sin(gamma * 0.5);
//     return [
//         cr * cp * cy + sr * sp * sy,
//         sr * cp * cy + cr * sp * sy,
//         cr * sp * cy + sr * cp * sy,
//         cr * cp * sy + sr * sp * cy
//     ];
// }
// function addQuaternion(q1, q2) {
//     return [
//         q1[0] + q2[0],
//         q1[1] + q2[1],
//         q1[2] + q2[2],
//         q1[3] + q2[3]
//     ];
// }
// function multiplyQuaternion(q1, q2) {
//     return [
//         q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2] - q1[3] * q2[3],
//         q1[0] * q2[1] + q1[1] * q2[0] + q1[2] * q2[3] - q1[3] * q2[2],
//         q1[0] * q2[2] - q1[1] * q2[3] + q1[2] * q2[0] + q1[3] * q2[1],
//         q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1] + q1[3] * q2[0]
//     ];
// }

function rotationMatrix(angle, axis) {
    axis = (axis || "x").toLowerCase();

    var c = Math.cos(angle);
    var s = Math.sin(angle);

    switch (axis) {
        case "x":
            return [[ 1,  0,  0],
                    [ 0,  c, -s],
                    [ 0,  s,  c]];
        case "y":
            return [[ c,  0,  s],
                    [ 0,  1,  0],
                    [-s,  0,  c]];
        case "z":
            return [[ c, -s,  0],
                    [ s,  c,  0],
                    [ 0,  0,  1]];
    }
}
function mirrorMatrix(axis) {
    axis = (axis || "x").toLowerCase();

    switch (axis) {
        case "x":
            return [[-1,  0,  0],
                    [ 0,  1,  0],
                    [ 0,  0,  1]];
        case "y":
            return [[ 1,  0,  0],
                    [ 0, -1,  0],
                    [ 0,  0,  1]];
        case "z":
            return [[ 1,  0,  0],
                    [ 0,  1,  0],
                    [ 0,  0, -1]];
    }
}
function multiplyRotationMatrix(m1, m2) {
    return [
        [
            m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0],
            m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1],
            m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2]
        ],
        [
            m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0],
            m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1],
            m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2]
        ],
        [
            m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0],
            m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1],
            m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2]
        ]
    ];
}
function invertRotationMatrix(matrix) {
    return [[matrix[0][0], matrix[1][0], matrix[2][0]],
            [matrix[0][1], matrix[1][1], matrix[2][1]],
            [matrix[0][2], matrix[1][2], matrix[2][2]]];
}
function eulerToRotationMatrix(angles, order) {
    order = (order || "xzx").toLowerCase();

    var alpha = angles[0];
    var beta = angles[1];
    var gamma = angles[2];

    var r1 = rotationMatrix(gamma, order[0]);
    var r2 = rotationMatrix(beta, order[1]);
    var r3 = rotationMatrix(alpha, order[2]);

    return multiplyRotationMatrix(r1, multiplyRotationMatrix(r2, r3));
}
function eulerFromRotationMatrix(matrix, order, offset) {
    // offset is to avoid issues caused by gimbal lock, adjust by yaw (gamma) by a number of degrees to keep beta within a desired range
    order = (order || "xzx").toLowerCase();
    offset = (offset || 0);

    // Euler and Tait-Bryan operate slightly differently, either way get beta first
    var alpha, beta, gamma, c2, s2;

    var m = multiplyRotationMatrix(matrix, rotationMatrix(offset, order[0]));

    if (order[0] === order[2]) {
        var c1c3_take_c2s1s3, c1s3_plus_c2c3s1, s1s2, c1s2, c3s2, s2s3;

        switch (order) {
            default:
            case "xzx":
                c2 = m[0][0];
                c1c3_take_c2s1s3 = m[2][2];
                c1s3_plus_c2c3s1 = m[2][1];
                s1s2 = m[2][0];
                c1s2 = m[1][0];
                c3s2 = -m[0][1];
                s2s3 = m[0][2];
                break;
            case "xyx":
                c2 = m[0][0];
                c1c3_take_c2s1s3 = m[1][1];
                c1s3_plus_c2c3s1 = -m[1][2];
                s1s2 = m[1][0];
                c1s2 = -m[2][0];
                c3s2 = m[0][2];
                s2s3 = m[0][1];
                break;
            case "yxy":
                c2 = m[1][1];
                c1c3_take_c2s1s3 = m[0][0];
                c1s3_plus_c2c3s1 = m[0][2];
                s1s2 = m[0][1];
                c1s2 = m[2][1];
                c3s2 = -m[1][2];
                s2s3 = m[1][0];
                break;
            case "yzy":
                c2 = m[1][1];
                c1c3_take_c2s1s3 = m[2][2];
                c1s3_plus_c2c3s1 = -m[2][0];
                s1s2 = m[2][1];
                c1s2 = -m[0][1];
                c3s2 = m[1][0];
                s2s3 = m[1][2];
                break;
            case "zyz":
                c2 = m[2][2];
                c1c3_take_c2s1s3 = m[1][1];
                c1s3_plus_c2c3s1 = m[1][0];
                s1s2 = m[1][2];
                c1s2 = m[0][2];
                c3s2 = -m[2][0];
                s2s3 = m[2][1];
                break;
            case "zxz":
                c2 = m[2][2];
                c1c3_take_c2s1s3 = m[0][0];
                c1s3_plus_c2c3s1 = -m[0][1];
                s1s2 = m[0][2];
                c1s2 = -m[1][2];
                c3s2 = m[2][1];
                s2s3 = m[2][0];
                break;
        }

        beta = Math.acos(c2);
        s2 = Math.sin(beta);

        // If c2 === +/- 1 then s2 === 0, which zeroes out a bunch of terms we would otherwise be relying on (but opens up new ones!)
        if (Math.abs(1 - Math.abs(c2)) < 0.0001) {
            alpha = 0;
            if (c2 > 0) {
                // 0 case
                gamma = Math.atan2(c1s3_plus_c2c3s1, c1c3_take_c2s1s3);
            }
            else {
                // pi case
                gamma = -Math.atan2(c1s3_plus_c2c3s1, c1c3_take_c2s1s3);
            }
        }
        else {
            gamma = Math.atan2(s1s2, c1s2);
            alpha = Math.atan2(s2s3, c3s2);
        }
    }
    else {
        var c1c3_take_s1s2s3, c1s3_plus_c3s1s2, c2s1, c1c2, c2c3, c2s3, invert;

        switch (order) {
            default:
            case "xzy":
                s2 = -m[0][1];
                invert = true;
                c1c3_take_s1s2s3 = m[2][2];
                c1s3_plus_c3s1s2 = -m[2][0];
                c2s1 = m[2][1];
                c1c2 = m[1][1];
                c2c3 = m[0][0];
                c2s3 = m[0][2];
                break;
            case "xyz":
                s2 = m[0][2];
                invert = false;
                c1c3_take_s1s2s3 = m[1][1];
                c1s3_plus_c3s1s2 = m[1][0];
                c2s1 = -m[1][2];
                c1c2 = m[2][2];
                c2c3 = m[0][0];
                c2s3 = -m[0][1];
                break;
            case "yxz":
                s2 = -m[1][2];
                invert = true;
                c1c3_take_s1s2s3 = m[0][0];
                c1s3_plus_c3s1s2 = -m[0][1];
                c2s1 = m[0][2];
                c1c2 = m[2][2];
                c2c3 = m[1][1];
                c2s3 = m[1][0];
                break;
            case "yzx":
                s2 = m[1][0];
                invert = false;
                c1c3_take_s1s2s3 = m[2][2];
                c1s3_plus_c3s1s2 = m[2][1];
                c2s1 = -m[2][0];
                c1c2 = m[0][0];
                c2c3 = m[1][1];
                c2s3 = -m[1][2];
                break;
            case "zyx":
                s2 = -m[2][0];
                invert = true;
                c1c3_take_s1s2s3 = m[1][1];
                c1s3_plus_c3s1s2 = -m[1][2];
                c2s1 = m[1][0];
                c1c2 = m[0][0];
                c2c3 = m[2][2];
                c2s3 = m[2][1];
                break;
            case "zxy":
                s2 = m[2][1];
                invert = false;
                c1c3_take_s1s2s3 = m[0][0];
                c1s3_plus_c3s1s2 = m[0][2];
                c2s1 = -m[0][1];
                c1c2 = m[1][1];
                c2c3 = m[2][2];
                c2s3 = -m[2][0];
                break;
        }

        beta = Math.asin(s2);
        c2 = Math.cos(beta);

        // If s2 === +/- 1 then c2 === 0, which zeroes out a bunch of terms we would otherwise be relying on (but opens up new ones!)
        if (Math.abs(1 - Math.abs(s2)) < 0.0001) {
            alpha = 0;
            if (s2 > 0) {
                // 0 case
                gamma = (invert ? -1 : 1) * Math.atan2(c1s3_plus_c3s1s2, c1c3_take_s1s2s3);
            }
            else {
                // pi case
                gamma = (invert ? 1 : -1) * Math.atan2(c1s3_plus_c3s1s2, c1c3_take_s1s2s3);
            }
        }
        else {
            gamma = Math.atan2(c2s1, c1c2);
            alpha = Math.atan2(c2s3, c2c3);
        }
    }

    return [alpha, beta, gamma - offset];
}
