const filessystem = require('fs');
const Ppt2PngConverter = require('ppt-png');

/**
 * ppt processor.
 */
class ppt {
    /**
     * Constructor.
     *
     * @param {object} io
     * @param {int}    uploads
     */
    constructor(io, uploads) {
        this.io = io;
        this.uploads = uploads;
    }

    /**
     * Process the ppt to png.
     *
     * @param {array}   files
     * @param {boolean} invert
     * @param {boolean} greyscale
     * @param {int}     uploads
     */
    process(files, invert, greyscale, uploads) {
        const outputDirectory = 'converted/' + this.uploads + '/';

        if(uploads) {
            this.uploads = uploads;
        }

        console.log('invert:' + invert + '|greyscale:' + greyscale);
        console.log('files: ', files.length);

        if(files) {
            if (!filessystem.existsSync(outputDirectory)) {
                filessystem.mkdirSync(outputDirectory);
            }

            const converter = Ppt2PngConverter.create({
                files:          files,
                output:         outputDirectory,
                invert:         invert || false,
                greyscale:      greyscale || false,
                deletePdfFile:  true,
                outputType:     'png',
                logLevel:       2,
                fileNameFormat: '_vers_%d'
            });


            const result = converter.convert();

            this.update(result);
        }
    }

    /**
     * Send an update with the websocket.
     *
     * @param {object} data
     */
    update(data) {
        console.log({
            data
        });
        // console.log(data.failed, data.success.length, data.files.length, data.time);
        this.io.update(data, this.uploads);
    }
}

module.exports = ppt;
