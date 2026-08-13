import { Session } from "express-session";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Types } from "mongoose";
import { Request } from "express";


export interface Member {
    _id: Types.ObjectId;
    memberType: MemberType;
    memberStatus: MemberStatus;
    memberNick: string;
    memberPhone: string;
    memberPassword?: string;
    memberImage?: string;
    memberAddress?: string;
    memberDesc?: string;
    memberPoints: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface MemberInput {
    memberType?: MemberType;
    memberStatus?: MemberStatus;
    memberNick: string;
    memberPhone: string;
    memberPassword: string;
    memberImage?: string;
    memberAddress?: string;
    memberDesc?: string;
    memberPoints?: number;
}

export interface LoginInput {
    memberNick: string;
    memberPassword: string;
}

export interface AdminRequest extends Request {
    member: Member;
    session: Session & {member: Member};
}