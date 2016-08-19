onmessage = function(e) {
    handleFiles(e.data);
}

function handleFiles(files) {

    function handleFile(file) {
        var reader = new FileReader();

        logInfo(file);

        reader.onload = function (e) {
            postMessage(e.target.result);

            if (files.length > 0) {
                setTimeout(function () {
                    handleFile(files.shift());
                }, 250);
            }
        };

        reader.readAsDataURL(file);
    }

    handleFile(files.shift());
}

function logInfo(file) {
    console.info('file name', file.name);
    console.log('file size', Math.round(file.size/1000) + ' KB');
}