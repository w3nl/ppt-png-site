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

    socket.on('uploaded', function(data) {
        $.each(data.success, function(fileIndex, file) {
            $('.js-converted').append('<h2>' + fileIndex + '</h2><ul>');
            $.each(file, function(verseIndex, verse) {
                $('.js-converted').append('<li><a href="/' + verse.path + '">' + verse.name + '</a></li>');
            });
            $('.js-converted').append('</ul>');
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
        dataType: 'json',
        error:    function(xhr) {
            status('Error: ' + xhr.status);
        },
        success: function(response) {
            $('.js-status').empty().text(response.status);
        }
    });

    return false;
}

addEventListener('DOMContentLoaded', init, false);
