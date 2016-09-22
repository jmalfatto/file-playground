onmessage = function(e) {
    handleFiles(e.data);
}

function handleFiles(files) {
    var start = new Date().getTime();

    function handleFile(file) {
        var reader = new FileReader();

        logInfo(file);

        reader.onload = function (e) {
            postMessage(e.target.result);

            if (files.length > 0) {
                setTimeout(function () {
                    handleFile(files.shift());
                }, 250);
            } else {
                var end = new Date().getTime();
                var time = end - start;

                console.log(time/1000 + 's');
            }
        };

        reader.readAsDataURL(file);
    }

    handleFile(files.shift());
}

function logFileAsArrayBuffer(file) {

}

function isValidJpeg(file) {
    var reader = new FileReader();

    reader.onload = function(evt) {
        var valid, arrayBuffer, byteArray, magicNumbers;
        if (evt.target.readyState == FileReader.DONE) {
            arrayBuffer = evt.target.result;

            if (arrayBuffer) {
                byteArray = new Uint8Array(arrayBuffer);

                if (byteArray && byteArray.length > 4) {
                    magicNumbers = [
                        byteArray[0].toString(16),
                        byteArray[1].toString(16),
                        byteArray[byteArray.length - 2].toString(16),
                        byteArray[byteArray.length - 1].toString(16)
                    ];
                    valid = magicNumbers[0].toLowerCase() === 'ff' && magicNumbers[1].toLowerCase() === 'd8'
                        && magicNumbers[2].toLowerCase() === 'ff' && magicNumbers[3].toLowerCase() === 'd9';
                    console.info('is valid jpeg', valid);
                }
            }
        }
    };

    reader.readAsArrayBuffer(file);
}

function logInfo(file) {
    console.info('file name', file.name);
    console.log('file size', Math.round(file.size/1000) + ' KB');
    isValidJpeg(file);
}