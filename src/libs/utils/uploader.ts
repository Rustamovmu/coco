import path from "path";
import multer from "multer";
import { v4 } from "uuid";

//  Multer Image Uploader
function getTargetImageStorage(address: any) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./uploads/${address}`);
        },
        filename: function (req, file, cb) {
            const extention = path.parse(file.originalname).ext;
            const random_name = v4() + extention;
            cb(null, random_name);
        },
    });
}

const makeUploader = (address: string) => {
    const storage = getTargetImageStorage(address);
    return multer({ storage: storage });
};

export default makeUploader;
