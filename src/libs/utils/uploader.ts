import path from "path";
import multer from "multer";
import { v4 } from "uuid";
import Errors, { HttpCode, Message } from "../Errors";

const profileImageExtensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

//  Multer Image Uploader
function getTargetImageStorage(address: string, profileImage: boolean) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./uploads/${address}`);
        },
        filename: function (req, file, cb) {
            const extention = profileImage
                ? profileImageExtensions[file.mimetype]
                : path.parse(file.originalname).ext;
            const random_name = v4() + extention;
            cb(null, random_name);
        },
    });
}

const makeUploader = (address: string, profileImage = false) => {
    const storage = getTargetImageStorage(address, profileImage);
    if (!profileImage) return multer({ storage });
    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 12, fieldSize: 8192, parts: 13 },
        fileFilter(req, file, cb) {
            const extension = path.extname(file.originalname).toLowerCase();
            const expected = profileImageExtensions[file.mimetype];
            if (!expected || (extension !== expected && !(expected === ".jpg" && extension === ".jpeg"))) {
                cb(new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED));
                return;
            }
            cb(null, true);
        },
    });
};

export default makeUploader;
