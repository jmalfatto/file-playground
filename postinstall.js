var fs = require('fs-extra');

const socketDir = __dirname + '/socket.io/';
const uploadDir = __dirname + '/uploads/';
const socketClientScript = 'socket.io.js';

dirSetup(socketDir);
dirSetup(uploadDir);

fs.ensureFile(socketClientScript, (err) => {
    let src = __dirname + '/node_modules/socket.io-client/' + socketClientScript;
    let dest = socketDir + socketClientScript;
    fs.copy(src, dest, (err) => {
        console.log(src + ' copied to ' + dest);
    });
});

function dirSetup(dir) {
    fs.ensureDir(dir, (err) => {
        console.log(dir + ' not found', err);
        fs.mkdirs(dir, (err) => {
            console.log(dir +' created', err);
        });
    });
}