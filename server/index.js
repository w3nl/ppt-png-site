const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

const Ppt = require('./ppt.js');
const Websocket = require('./websocket.js');

let fileUploads = 0;
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './upload');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + fileUploads + '-' + Date.now());
        fileUploads++;
    }
});

const upload = multer({
    storage: storage
}).array('ppt', 2);

const httpPort = 3000;
const socketPort = 3001;

let uploads = 0;
const io = new Websocket(app, socketPort, uploads);

app.use(bodyParser.json());

app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if(err) {
            return res.json({
                status: 'Error uploading file.'
            });
        }

        const pptpng = new Ppt(io, uploads);

        let ppt = req.files;
        let invert = false;
        let greyscale = false;

        if (!ppt || ppt.length < 1) {
            return res.json({
                status: 'No files were uploaded.'
            });
        }

        if(req.body) {
            invert = req.body.invert || false;
            greyscale = req.body.greyscale || false;
        }

        pptpng.process(req.files, invert, greyscale);

        res.json({
            status: 'File is uploaded'
        });
    });

    uploads++;
});

app.use(express.static('public'));
app.use('/converted', express.static('converted'));

app.listen(httpPort, function() {
    console.log('Example app listening on port ' + httpPort + '!');
});
