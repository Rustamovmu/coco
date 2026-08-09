import { Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";

const adminController: T = {};
const memberService = new MemberService();

adminController.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome");
        res.send("Home Page");

    } catch (err) {
        console.log("Error, goHome:", err);
    }

};

adminController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin");
        res.send("Login Page");

    } catch (err) {
        console.log("Error, getLogin:", err);
    }

};

adminController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup");
        res.send("Signup Page");

    } catch (err) {
        console.log("Error, getSignup:", err);
    }

};

adminController.processLogin = (req: Request, res: Response) => {
    try {
        console.log("processLogin");
        res.send("Login Process");
    } catch (err) {
        console.log("Error, processLogin:", err);
    }

};

adminController.processSignup = (req: Request, res: Response) => {
    try {
        console.log("processSignup");
        res.send("Signup Process");
    } catch (err) {
        console.log("Error, processSignup:", err);
    }

};

export default adminController;