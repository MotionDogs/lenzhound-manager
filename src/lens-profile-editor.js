const React = require('react');
const ReactDOM = require('react-dom');
const rationalRegression = require('./rational-regression');

module.exports = React.createClass({

    componentDidMount() {
        var canvas = ReactDOM.findDOMNode(this.refs.canvas);
        var ctx = canvas.getContext('2d');

        var vals_ = [
            [16,70],
            [41,30],
            [63,20],
            [87,15],
            [110,12],
            [133,10],
            [164,8],
            [206,6]
        ];

        var vals = [
            [16,70],
            [110,12],
            [206,6]
        ];

        var maxFunc = (a,b) => a > b ? a : b;
        var maxX = vals.map(v => v[0]).reduce(maxFunc,0);
        var maxY = vals.map(v => v[1]).reduce(maxFunc,0);

        var co = rationalRegression(vals);
        var eq = (x) => (co[0] * x + co[2]) / (x - co[1]);

        // var eq = x => (-0.4688 * x + 1389.6885)/(x + 3.8679);

        ctx.beginPath();

        var xscale = 300;
        var yscale = 200;

        vals_.forEach(v => {
            var x = (v[0]/maxX) * xscale;
            var y = yscale - ((v[1] / maxY) * yscale);
            ctx.moveTo(x,y);
            ctx.arc(x,y,4,0,2*Math.PI);
        });

        vals.forEach(v => {
            var x = (v[0]/maxX) * xscale;
            var y = yscale - ((v[1] / maxY) * yscale);
            ctx.moveTo(x,y);
            ctx.arc(x,y,8,0,2*Math.PI);
        });

        ctx.moveTo(0,0);

        for (var i = 0; i < xscale; i++) {
            var x = (i / xscale) * maxX;
            var y = eq(x);
            var j = yscale - ((y / maxY) * yscale);
            ctx.lineTo(i, j);
        }

        ctx.stroke();
    },

    render() {
        return (
            <div>
                <canvas ref="canvas" width={300} height={200} />
            </div>
        );
    }
});