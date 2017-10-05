const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
var Converter = require('ppt-png');
var glob = require('glob');

require('array-helpers');

app.use(fileUpload());

app.post('/upload', function(req, res) {
    if (!req.files || !req.files.ppt) {
        return res.status(400).send('No files were uploaded.');
    }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let ppt = req.files.ppt;
    let invert = false;
    let greyscale = false;

    if(req.body) {
        invert = req.body.invert || false;
        greyscale = req.body.greyscale || false;
    }

  // Use the mv() method to place the file somewhere on your server
    ppt.mv('upload/tmp.ppt', function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        res.send('File uploaded!');
    });

    process(invert, greyscale);
});

app.use(express.static('public'));

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

/**
 * Process the ppt.
 *
 * @param {boolean} invert
 * @param {boolean} greyscale
 */
function process(invert, greyscale) {
    console.log('invert:' + invert + '|greyscale:' + greyscale);
    glob('upload/tmp.ppt', {}, convert);

    /**
     * Convert the ppt to png.
     *
     * @param {object} error
     * @param {array} files
     */
    function convert(error, files) {
        console.log('files: ', files.length);
        if(files) {
            new Converter({
                files:          files,
                output:         'converted/',
                invert:         invert || false,
                greyscale:      greyscale || false,
                deletePdfFile:  true,
                outputType:     'png',
                logLevel:       2,
                fileNameFormat: '_vers_%d'
            }).wait().then(function(data) {
                console.log(data.failed, data.success.length, data.files.length, data.time);
                if(data.failed.length > 0) {
                    convert(null, data.failed.multikey('file'));
                }
            });
        }
    }
}
