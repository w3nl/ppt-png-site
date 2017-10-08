const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
var Converter = require('ppt-png');

var http = require('http');
var server = http.createServer(app).listen(3001);
var io = require('socket.io').listen(server);
var filessystem = require('fs');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './upload');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({
    storage: storage
}).array('ppt', 2);

let uploads = 0;

require('array-helpers');

app.use(bodyParser.json());


io.on('connection', function(socket) {
    socket.emit('uploaded', {
        failed:  [],
        success: [],
        files:   [],
        time:    0,
        uploads: uploads
    });
});

app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if(err) {
            return res.end('Error uploading file.');
        }

        let ppt = req.files;
        let invert = false;
        let greyscale = false;

        if (!ppt || ppt.length < 1) {
            return res.status(400).send('No files were uploaded.');
        }

        if(req.body) {
            invert = req.body.invert || false;
            greyscale = req.body.greyscale || false;
        }

        process(req.files, invert, greyscale);

        res.end('<result>File is uploaded</result>');
    });

    uploads++;
});

app.use(express.static('public'));
app.use('/converted', express.static('converted'));

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

/**
 * Process the ppt.
 *
 * @param {array} files
 * @param {boolean} invert
 * @param {boolean} greyscale
 */
function process(files, invert, greyscale) {
    var outputDirectory = 'converted/' + uploads + '/';

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
        }).wait().then(function(data) {
            console.log(data.failed, data.success.length, data.files.length, data.time);
            io.emit('uploaded', {
                failed:  data.failed,
                success: data.success,
                files:   data.files,
                time:    data.time
            });
        });
    }
}
