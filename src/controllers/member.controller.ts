 import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, MemberInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";

const memberService = new MemberService();
const authService = new AuthService();
const memberController: T = {};
const accessTokenCookie = {
    maxAge: AUTH_TIMER * 3600 * 1000,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
};

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("signup");

        const input: MemberInput = req.body;
        const result = await memberService.signup(input);
        const token = await authService.createToken(result);

        res.cookie("accessToken", token, accessTokenCookie);
        res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
    } catch (err) {
        console.log("Error, signup:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
        // res.json({error: err});
    }

};

memberController.login = async (req: Request, res: Response) => {
    try {
        console.log("login");
        const input: LoginInput = req.body;
        const result = await memberService.login(input);

        const token = await authService.createToken(result);
         

        res.cookie("accessToken", token, accessTokenCookie);
        res.status(HttpCode.OK).json({ member: result, accessToken: token });
    } catch (err) {
        console.log("Error, login:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }

};

memberController.logout = (req: Request, res: Response) => {
    try {
        console.log("logout");
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(HttpCode.OK).json({ logout: true });
    } catch (err) {
        console.log("Error, logout:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

memberController.verifyAuth = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        }

        req.member = await authService.checkAuth(token);
        next();
    } catch (err) {
        console.log("Error, verifyAuth:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

export default memberController;
