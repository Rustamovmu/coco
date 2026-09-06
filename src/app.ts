import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router.admin"
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";
import cookieParser from "cookie-parser";
import cors from "cors";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection: "sessions"
});
// ** 1-ENTRANCE **//
const app = express();
const frontendOrigins = (process.env.FRONTEND_ORIGINS
    ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"))
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
app.use(cors({ origin: frontendOrigins, credentials: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    "/uploads/products",
    express.static(path.join(process.cwd(), "uploads", "products"))
);
app.use(
    "/uploads/members",
    express.static(path.join(process.cwd(), "uploads", "members"), {
        setHeaders(res) {
            res.setHeader("X-Content-Type-Options", "nosniff");
        },
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

// ** 2-SESSIONS **//
app.use(
    session({
        secret: String(process.env.SESSION_SECRET),
        cookie: {
            maxAge: 1000 * 3600 * 6
        },
        store: store,
        resave: true,
        saveUninitialized: true,
    })
);

app.use(function (req, res, next) {
    const sessionInstance = req.session as T;
    res.locals.member = sessionInstance.member;
    next();
}); 

app.use(function (req, res, next) {
    const sessionInstance = req.session as T;
    res.locals.member = sessionInstance.member;
    next();
});
// ** 3-VIEWS **//
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")

// ** 4-ROUTES **//
app.use("/admin",routerAdmin);
app.use("/",router); // Single page application (SPA) route, all other routes will be handled by the frontend

export default app;
