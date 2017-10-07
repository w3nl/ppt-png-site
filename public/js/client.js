/**
 * Upload the documents.
 */
function init() {
    $('#uploadForm').submit(upload);
    websocket();
}

/**
 * Websocket test.
 */
function websocket() {
    var socket = io.connect('http://localhost:3001');

    socket.on('news', function(data) {
        console.log(data);
        socket.emit('my other event', {
            my: 'data'
        });
    });
}

/**
 * Upload the documents.
 *
 * @return {bool}
 */
function upload() {
    $('.js-status').empty().text('File is uploading...');

    $(this).ajaxSubmit({
        error: function(xhr) {
            status('Error: ' + xhr.status);
        },
        success: function(response) {
            $('.js-status').empty().text(response);
        }
    });

    return false;
}

addEventListener('DOMContentLoaded', init, false);
