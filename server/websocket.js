const http = require('http');

/**
 * Websocket.
 */
class Websocket {
    /**
     * Constructor.
     *
     * @param {object} app
     * @param {int} port
     * @param {int} uploads
     */
    constructor(app, port, uploads) {
        const server = http.createServer(app).listen(port);

        this.io = require('socket.io').listen(server);

        this.uploads = uploads;

        this.io.on('connection', this.listen);
    }

    /**
     * Listen to the websocket.
     *
     * @param {object} socket
     */
    listen(socket) {
        socket.emit('uploaded', {
            failed:  [],
            success: [],
            files:   [],
            time:    0,
            uploads: this.uploads
        });
    }

    /**
     * Send an update with the websocket.
     *
     * @param {object} data
     */
    update(data) {
        this.io.emit('uploaded', {
            failed:  data.failed,
            success: data.success,
            files:   data.files,
            time:    data.time
        });
    }
}

module.exports = Websocket;
