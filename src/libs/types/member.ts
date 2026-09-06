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

export interface AuthMember {
    _id: Types.ObjectId;
    memberType: MemberType;
    memberStatus: MemberStatus;
    memberNick: string;
}

export type PublicMember = Pick<
    Member,
    "_id" | "memberType" | "memberNick" | "memberImage" | "memberDesc" | "memberPoints"
>;

export type TopMember = PublicMember & {
    rank: number;
    purchaseCount: number;
    productsBought: number;
    totalSpent: number;
};

export interface MemberProfileUpdateInput {
    memberNick?: string;
    memberPhone?: string;
    memberPassword?: string;
    memberAddress?: string;
    memberDesc?: string;
    memberImage?: string;
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

export interface MemberUpdateInput {
    _id: Types.ObjectId;
    memberStatus?: MemberStatus;
    memberNick?: string;
    memberPhone?: string;
    memberPassword?: string;
    memberImage?: string;
    memberAddress?: string;
    memberDesc?: string;
}

export interface AdminRequest extends Request {
    member: Member;
    session: Session & {member: Member};
    file: Express.Multer.File;
    files: Express.Multer.File[];
}

export interface ExtendedRequest extends Request {
    member?: AuthMember;
}
