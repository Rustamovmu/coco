import express from "express";
const routerAdmin = express.Router();
import adminController from "./controllers/admin.controller";

// ** Admin Routes **//
routerAdmin.get("/", adminController.goHome);

routerAdmin
    .get("/login", adminController.getLogin)
    .post("/login", adminController.processLogin);

routerAdmin
    .get("/signup", adminController.getSignup)
    .post("/signup", adminController.processSignup);

routerAdmin.get("/logout", adminController.logout);
routerAdmin.get("/check", adminController.checkAuthSession);

// ** Product Routes **//

// ** User Routes **//


export default routerAdmin;