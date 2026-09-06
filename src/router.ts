import express, { ErrorRequestHandler } from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";
import multer from "multer";
import Errors, { HttpCode } from "./libs/Errors";

// Keep the existing authentication URLs for current clients.
router.post("/signup", memberController.signup);
router.post("/login", memberController.login);
router.post("/logout", memberController.logout);

router.get("/member/admin", memberController.getAdmin);
router.post("/member/signup", memberController.signup);
router.post("/member/login", memberController.login);
router.post("/member/logout", memberController.verifyAuth, memberController.logout);
router.get("/member/detail", memberController.verifyAuth, memberController.getMemberDetail);
router.post(
    "/member/update",
    memberController.verifyAuth,
    makeUploader("members", true).single("memberImage"),
    memberController.updateMember
);
router.get("/member/top-users", memberController.getTopUsers);

router.get("/product/all", productController.getProducts);
router.get("/product/:id", productController.getProduct);

const handleApiError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message });
    } else if (err instanceof Errors) {
        res.status(err.code).json(err);
    } else {
        next(err);
    }
};
router.use(handleApiError);

export default router;
