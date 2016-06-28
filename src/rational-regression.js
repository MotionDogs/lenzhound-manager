var mul = (A,x) => [
    A[0][0] * x[0] + A[0][1] * x[1] + A[0][2] * x[2],
    A[1][0] * x[0] + A[1][1] * x[1] + A[1][2] * x[2],
    A[2][0] * x[0] + A[2][1] * x[1] + A[2][2] * x[2],
];

var scalarMul = (s,A) => A.map(a => a.map(x => s * x));

var det = (A) =>
    A[0][0] * A[1][1] * A[2][2] +
    A[0][1] * A[1][2] * A[2][0] +
    A[0][2] * A[1][0] * A[2][1] -
    A[0][2] * A[1][1] * A[2][0] -
    A[0][0] * A[1][2] * A[2][1] -
    A[0][1] * A[1][0] * A[2][2];

var inv = (A) => scalarMul(1/det(A),[
    [
        A[1][1] * A[2][2] - A[1][2] * A[2][1],
        -A[0][1] * A[2][2] + A[0][2] * A[2][1],
        A[0][1] * A[1][2] - A[0][2] * A[1][1],
    ],
    [
        -A[1][0] * A[2][2] + A[1][2] * A[2][0],
        A[0][0] * A[2][2] - A[0][2] * A[2][0],
        -A[0][0] * A[1][2] + A[0][2] * A[1][0],
    ],
    [
        A[1][0] * A[2][1] - A[1][1] * A[2][0],
        -A[0][0] * A[2][1] + A[0][1] * A[2][0],
        A[0][0] * A[1][1] - A[0][1] * A[1][0],
    ],
]);


// finds the best fit function of the form y = (ax + c)/(x - b)
// using the least squares method
// 
// [[x0,y0],[x1,y1],...,[xn,yn]] -> [a,b,c]

module.exports = function (vs) {

    var mapSum = (fn) => vs.reduce((memo,next) => memo+fn(next), 0);
    var sq = (x) => x * x;

    var n = vs.length;
    var xsSq = mapSum(v => sq(v[0]));
    var ysSq = mapSum(v => sq(v[1]));
    var xys = mapSum(v => v[0] * v[1]);
    var xs = mapSum(v => v[0]);
    var ys = mapSum(v => v[1]);

    var A = [
        [xsSq, xys,  xs],
        [xys,  ysSq, ys],
        [xs,   ys,   n ],
    ];

    var xsSqy = mapSum(v => sq(v[0]) * v[1]);
    var ysSqx = mapSum(v => sq(v[1]) * v[0]);

    var b = [xsSqy,ysSqx,xys];

    console.log(det(A));

    // Ax = b -> x = A^-1b
    var AInv = inv(A);

    console.log(AInv);

    var x = mul(AInv, b);

    console.log(x);

    return x;
}