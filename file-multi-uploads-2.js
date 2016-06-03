/*
 Combines Ray Camden's XHR2 demo (see url below) with socket.io demo

 https://www.raymondcamden.com/2016/05/05/uploading-multiple-files-at-once-with-ajax-and-xhr2/
 */

var $f1;

$(document).ready(function() {
    $('#testForm').on('submit', processForm);
    $f1 = $('#file1');  
});

function processForm(e) {
    e.preventDefault();
    console.log('processForm');
    
    var formData = new FormData();
    if($f1.val()) {
        var fileList = $f1.get(0).files;
        for(var x=0;x<fileList.length;x++) {
            formData.append('file'+x, fileList.item(x));    
            console.log('appended a file');
        }
    }

    var request = new XMLHttpRequest();
    var url = window.location.protocol + '//' + window.location.host + '/upload';
    request.open('POST', url);
    request.send(formData);
    
    request.onload = function(e) {
        console.log('Request Status', request.status);
    };
    
}

var socket = io();
socket.on('news', function (data) {
    console.log(data);
    if(data.bytesReceived && data.bytesExpected) {
        var percent = parseInt(data.bytesReceived/data.bytesExpected * 100);
        progress = percent === 100 ? 'Done' : percent + '%';
        $('#progress').text(progress);
    }
});