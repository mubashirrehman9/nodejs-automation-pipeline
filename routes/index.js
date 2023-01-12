let fs = require('fs');
let path = require('path');
const express = require('express');
var app = express();

const router = express.Router();
var multer = require('multer');
const decompress = require("decompress");
const fsExtea = require('fs-extra');
const { ensureAuthenticated } = require('../config/checkAuth')
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

//------------ Welcome Route ------------//
router.get('/', (req, res) => {
    res.render('welcome');
});

//------------ Dashboard Route ------------//
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dash', {
    name: req.user.name
}));

var upload = multer({ storage: storage }).single('uebuild');
router.post('/upload', ensureAuthenticated, function (req, res, next) {
    upload(req, res, async function (err) {
        if (err) {
            return res.end("Something went wrong:(");
        }

        if (!fs.existsSync('./buildversion')) {
            fs.mkdirSync(dir);
        }
      
        const uploadDir = path.join(__dirname, '../', 'uploads')
        const buildversionDir = path.join(__dirname, '../', 'buildversion')
        const liveserverDir = path.join(__dirname, '../','../','SignallingWebServer', 'Game')
        const buildversionFolder = fs.readdirSync(buildversionDir);
        const uploadedFiles = fs.readdirSync(uploadDir)
        const mainUploadFile = path.join(uploadDir, uploadedFiles[0])


        await fsExtea.copy(liveserverDir, path.join(buildversionDir, 'buildV' + (buildversionFolder.length + 1)))
        fs.rmSync(liveserverDir, { recursive: true, force: true });
        
        if (!fs.existsSync(liveserverDir)) {
            fs.mkdirSync(liveserverDir);
        }
        decompress(mainUploadFile, liveserverDir)
            .then((files) => {
                console.log(files);
                fs.unlinkSync(mainUploadFile)

            })
            .catch((error) => {
                console.log(error);
            });
        res.end("Upload completed.");
    });
})

module.exports = router;