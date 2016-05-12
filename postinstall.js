var fs = require('fs-extra');

const socketDir = __dirname + '/socket.io/';
const uploadDir = __dirname + '/uploads/';
const socketClientScriptName = 'socket.io.js';
const socketClientScriptSrc = __dirname + '/node_modules/socket.io-client/' + socketClientScriptName;

dirSetup(socketDir);
dirSetup(uploadDir);

fs.ensureFile(socketClientScriptSrc, (err) => {
    let src = socketClientScriptSrc;
    let dest = socketDir + socketClientScriptName;
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