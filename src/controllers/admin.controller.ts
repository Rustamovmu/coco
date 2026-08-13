import { Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { Message } from "../libs/Errors";

const adminController: T = {};
const memberService = new MemberService();

adminController.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome");
        res.render("home")

    } catch (err) {
        console.log("Error, goHome:", err);
        res.redirect("/admin")
    }

};

adminController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup");
        res.render("signup");

    } catch (err) {
        console.log("Error, getSignup:", err);
        res.redirect("/admin")
    }

};

adminController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processSignup");

        const newMember: MemberInput = req.body;
        newMember.memberType = MemberType.ADMIN;

        const result = await memberService.processSignup(newMember);
        req.session.member = result;
        req.session.save(function () {
            res.send(result);
        });
    } catch (err) {
        console.log("Error, processSignup:", err);
        const message =
            err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script>alert('${message}'); window.location.replace('/admin/signup');</script>`
        );
    }

};

adminController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin");
        res.render("login");

    } catch (err) {
        console.log("Error, getLogin:", err);
        res.redirect("/admin")
    }

};


adminController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");
        console.log("body:", req.body);
        const input: LoginInput = req.body;

        const result = await memberService.processLogin(input);
        // TODO: SESSION AUTHENTICATION

        req.session.member = result;
        req.session.save(function () {
            res.send(result);
        });
    } catch (err) {
        console.log("Error, processLogin:", err);
        const message =
            err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script>alert('${message}'); window.location.replace('/admin/login');</script>`
        );

    }

};


adminController.logout = async (req: AdminRequest, res: Response) => {
    try {
        console.log("logout");
        req.session.destroy(function () {
            res.redirect("/admin");
        });
    } catch (err) {
        console.log("Error, logout:", err);
        res.redirect("/admin");
    }

};

adminController.checkAuthSession = async (req: AdminRequest, res: Response) => {
    try {
        console.log("checkAuthSession");
        if (req.session.member) res.send(`Hi, ${req.session.member.memberNick}`);
        else res.send(Message.NOT_AUTHENTICATED);

    } catch (err) {
        console.log("Error, checkAuthSession:", err);
        res.send(err);
    }

};

export default adminController;
