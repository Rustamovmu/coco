import { Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";

const adminController: T = {};
const memberService = new MemberService();

adminController.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome");
        res.render("home")

    } catch (err) {
        console.log("Error, goHome:", err);
    }

};

adminController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin");
        res.render("login");

    } catch (err) {
        console.log("Error, getLogin:", err);
    }

};

adminController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup");
        res.render("signup");

    } catch (err) {
        console.log("Error, getSignup:", err);
    }

};

adminController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");
        const input: LoginInput = req.body;

        const result = await memberService.processLogin(input);
        req.session.member = result;
        req.session.save(function () {
            res.send(result);
        });
    } catch (err) {
        console.log("Error, processLogin:", err);
        res.send( err);
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
        res.send(err);
    }

};

export default adminController;
