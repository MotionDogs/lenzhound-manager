var util = require('util');
var https = require('https');

https.get({
    host: 'api.github.com',
    path: '/repos/SquareWave/Lenzhound-1.x/contents/bin',
    headers: {
        'User-Agent': 'Lenzhound'
    },
}, (res) => {
    console.log(util.inspect(res.statusCode));
});
