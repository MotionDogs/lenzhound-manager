"use strict";

var mul = function mul(A, x) {
    return [A[0][0] * x[0] + A[0][1] * x[1] + A[0][2] * x[2], A[1][0] * x[0] + A[1][1] * x[1] + A[1][2] * x[2], A[2][0] * x[0] + A[2][1] * x[1] + A[2][2] * x[2]];
};

var scalarMul = function scalarMul(s, A) {
    return A.map(function (a) {
        return a.map(function (x) {
            return s * x;
        });
    });
};

var det = function det(A) {
    return A[0][0] * A[1][1] * A[2][2] + A[0][1] * A[1][2] * A[2][0] + A[0][2] * A[1][0] * A[2][1] - A[0][2] * A[1][1] * A[2][0] - A[0][0] * A[1][2] * A[2][1] - A[0][1] * A[1][0] * A[2][2];
};

var inv = function inv(A) {
    return scalarMul(1 / det(A), [[A[1][1] * A[2][2] - A[1][2] * A[2][1], -A[0][1] * A[2][2] + A[0][2] * A[2][1], A[0][1] * A[1][2] - A[0][2] * A[1][1]], [-A[1][0] * A[2][2] + A[1][2] * A[2][0], A[0][0] * A[2][2] - A[0][2] * A[2][0], -A[0][0] * A[1][2] + A[0][2] * A[1][0]], [A[1][0] * A[2][1] - A[1][1] * A[2][0], -A[0][0] * A[2][1] + A[0][1] * A[2][0], A[0][0] * A[1][1] - A[0][1] * A[1][0]]]);
};

// finds the best fit function of the form y = (ax + c)/(x - b)
// using the least squares method
//
// [[x0,y0],[x1,y1],...,[xn,yn]] -> [a,b,c]

module.exports = function (vs) {

    var mapSum = function mapSum(fn) {
        return vs.reduce(function (memo, next) {
            return memo + fn(next);
        }, 0);
    };
    var sq = function sq(x) {
        return x * x;
    };

    var n = vs.length;
    var xsSq = mapSum(function (v) {
        return sq(v[0]);
    });
    var ysSq = mapSum(function (v) {
        return sq(v[1]);
    });
    var xys = mapSum(function (v) {
        return v[0] * v[1];
    });
    var xs = mapSum(function (v) {
        return v[0];
    });
    var ys = mapSum(function (v) {
        return v[1];
    });

    var A = [[xsSq, xys, xs], [xys, ysSq, ys], [xs, ys, n]];

    var xsSqy = mapSum(function (v) {
        return sq(v[0]) * v[1];
    });
    var ysSqx = mapSum(function (v) {
        return sq(v[1]) * v[0];
    });

    var b = [xsSqy, ysSqx, xys];

    var AInv = inv(A);
    var x = mul(AInv, b);

    return x;
};