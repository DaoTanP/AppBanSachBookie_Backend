const multer = require('multer');

let DIR = './public';

let FILENAME = undefined;

const setStorageDirectory = dir => DIR = dir;
const setFileName = filename => FILENAME = filename;

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, DIR);
    },
    filename: (req, file, callback) => {
        const fileName = FILENAME ? FILENAME + '.' + file.mimetype.split('/')[1] :
            file.originalname.toLowerCase().split(' ').join('_');
        callback(null, fileName);
    }
});

const uploadImages = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

module.exports = {
    uploadImages,
    setStorageDirectory,
    setFileName
}