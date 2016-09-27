onmessage = function(e) {
    //handleFiles(e.data);
    getFileClone(e.data[0]);
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

function getFileClone(file) {
    var reader = new FileReader();

    reader.onload = function(evt) {
        var buffer, typedArray, blob;
        if (evt.target.readyState == FileReader.DONE) {
            buffer = evt.target.result;

            if (buffer) {
                typedArray = new Uint8Array(buffer);
                typedArray[typedArray.length-1] = 0xDD; // demonstrate that browser forgives invalid footer (not header, though!)

                blob = new Blob([typedArray], { type: 'image/jpeg' });

                logInfo(blob);

                var url = URL.createObjectURL(blob);

                postMessage(url);
            }
        }
    };

    reader.readAsArrayBuffer(file);
}

function isValidJpeg(file) {
    var reader = new FileReader();

    reader.onload = function(evt) {
        var valid, arrayBuffer, typedArray, magicNumbers;
        if (evt.target.readyState == FileReader.DONE) {
            arrayBuffer = evt.target.result;

            if (arrayBuffer) {
                typedArray = new Uint8Array(arrayBuffer);

                if (typedArray && typedArray.length >= 4) {
                    magicNumbers = [
                        typedArray[0],
                        typedArray[1],
                        typedArray[typedArray.length - 2],
                        typedArray[typedArray.length - 1]
                    ];
                    valid = magicNumbers[0] === 0xFF && magicNumbers[1] === 0xD8
                        && magicNumbers[2] === 0xFF && magicNumbers[3] === 0xD9;

                    console.info('is valid jpeg', valid, magicNumbers);
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