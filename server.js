var app = require('express')();
var server = require('http').Server(app);
var formidable = require('formidable');
var fs = require('fs-extra');
var io = require('socket.io')(server);
var util = require('util');
var serveIndex = require('serve-index');

const uploadDir = __dirname + '/uploads/';

app.set('port', process.env.PORT || 3000);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/*.*', function (req, res) {
   res.sendFile( __dirname + req.url );
});

app.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    
    form.on('progress', function (bytesReceived, bytesExpected) {
        var uploadStatus = 'bytesReceived: ' + bytesReceived + ', bytesExpected: ' + bytesExpected;
        console.log(uploadStatus);
        io.emit('news', { bytesReceived, bytesExpected });
    });

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('Upload received :\n');
        res.end(util.inspect({fields: fields, files: files}));
    });

    form.on('end', function (fields, files) {
        for (var i=0; i< this.openedFiles.length; i++) {
            var file = this.openedFiles[i];
            var newPath = uploadDir + file.name;
            fs.copy(file.path, newPath, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('success!', file.name)
                }
            });
        }
    });

});

app.use('/', serveIndex(__dirname));

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(app.get('port'), () => {
    console.log('Express running on http://localhost:' + app.get('port'));
});