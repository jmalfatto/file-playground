var app = require('express')();
var server = require('http').Server(app);
var formidable = require('formidable');
var fs = require('fs-extra');
var io = require('socket.io')(server);

const uploadDir = __dirname + '/uploads/';

app.set('port', process.env.PORT || 3000);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
   res.send('nope');
});

app.get('/*.*', function (req, res) {
   res.sendFile( __dirname + req.url );
});

app.post('/upload', function (req, res) {
    let form = new formidable.IncomingForm();
    
    form.on('progress', function (bytesReceived, bytesExpected) {
        let uploadStatus = 'bytesReceived: ' + bytesReceived + ', bytesExpected: ' + bytesExpected;
        console.log(uploadStatus);
        io.emit('news', { bytesReceived, bytesExpected });
    });
    
    form.parse(req, function (err, fields, files) {
        for (let key in files) {
            fs.readFile(files[key].path, function (err, data) {
                let newPath = uploadDir + files[key].name;
                fs.outputFile(newPath, data, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('It\'s saved!');
                });
           });
        }
    });
    res.send('Thank you');
});

io.on('connection', function (socket){
    console.log('a user connected');
});

server.listen(app.get('port'), function () {
    console.log('Express running on http://localhost:' + app.get('port'));
});