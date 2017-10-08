const filessystem = require('fs');
const Converter = require('ppt-png');

/**
 * ppt processor.
 */
class ppt {
    /**
     * Constructor.
     *
     * @param {object} io
     * @param {int} uploads
     */
    constructor(io, uploads) {
        this.io = io;
        this.uploads = uploads;
    }

    /**
     * Process the ppt to png.
     *
     * @param {array} files
     * @param {boolean} invert
     * @param {boolean} greyscale
     */
    process(files, invert, greyscale) {
        const outputDirectory = 'converted/' + this.uploads + '/';

        console.log('invert:' + invert + '|greyscale:' + greyscale);
        console.log('files: ', files.length);

        if(files) {
            if (!filessystem.existsSync(outputDirectory)) {
                filessystem.mkdirSync(outputDirectory);
            }

            new Converter({
                files:          files,
                output:         outputDirectory,
                invert:         invert || false,
                greyscale:      greyscale || false,
                deletePdfFile:  true,
                outputType:     'png',
                logLevel:       2,
                fileNameFormat: '_vers_%d'
            }).wait().then(this.update.bind(this));
        }
    }

    /**
     * Send an update with the websocket.
     *
     * @param {object} data
     */
    update(data) {
        console.log(data.failed, data.success.length, data.files.length, data.time);
        this.io.update(data);
    }
}

module.exports = ppt;
