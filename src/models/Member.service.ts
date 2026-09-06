import { shapeIntoMongooseObjectid } from "../libs/config";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { AuthMember, LoginInput, Member, MemberInput, MemberProfileUpdateInput, MemberUpdateInput, PublicMember } from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";
import { FlattenMaps } from "mongoose";

const publicMemberFields = "_id memberType memberNick memberImage memberDesc memberPoints";

function validateMemberFields(input: MemberProfileUpdateInput, required: string[] = []): void {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
    for (const field of ["memberNick", "memberPhone", "memberPassword", "memberAddress", "memberDesc", "memberImage"] as const) {
        const value = input[field];
        if (value === undefined && !required.includes(field)) continue;
        if (typeof value !== "string" || value.length > (field === "memberDesc" ? 2000 : 500)
            || ((required.includes(field) || ["memberNick", "memberPhone", "memberPassword"].includes(field)) && !value.trim())
            || (field === "memberPassword" && Buffer.byteLength(value, "utf8") > 72)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
        }
    }
}

class MemberService {
    private readonly memberModel = MemberModel;

   
    constructor() {
        this.memberModel = MemberModel;
    }

       // SPA

    public async signup(input: MemberInput): Promise<FlattenMaps<Member>> {
        validateMemberFields(input, ["memberNick", "memberPhone", "memberPassword"]);
        const salt = await bcrypt.genSalt(10);
        const memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create({
                memberNick: input.memberNick.trim(),
                memberPhone: input.memberPhone.trim(),
                memberPassword,
                memberAddress: input.memberAddress,
                memberDesc: input.memberDesc,
                memberType: MemberType.USER,
                memberStatus: MemberStatus.ACTIVE,
                memberPoints: 0,
            });
            result.memberPassword = undefined;

            return result.toJSON();
        } catch (err) {
            console.log("Error in MemberService.signup:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }
    }

    public async login(input: LoginInput): Promise<Member> {
        validateMemberFields(input, ["memberNick", "memberPassword"]);
        const member = await this.memberModel
            .findOne(
               {
                    memberNick: input.memberNick.trim(),
                    memberStatus: { $ne: MemberStatus.DELETE },
                },
                { memberNick: 1, memberPassword: 1, memberStatus: 1 })
            .exec();
        if (!member) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }
        else if (member.memberStatus === MemberStatus.BLOCK) {
            throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
        }

        if (!member.memberPassword) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);
        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result = await this.memberModel.findById(member._id).lean().exec();

        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }
        result.memberPassword = undefined;
        return result;
    }

    public async getAdmin(): Promise<PublicMember> {
        const result = await this.memberModel
            .findOne({ memberType: MemberType.ADMIN, memberStatus: MemberStatus.ACTIVE })
            .select(publicMemberFields)
            .lean<PublicMember>()
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    public async getTopUsers(): Promise<PublicMember[]> {
        return this.memberModel
            .find({ memberType: MemberType.USER, memberStatus: MemberStatus.ACTIVE })
            .select(publicMemberFields)
            .sort({ memberPoints: -1, _id: 1 })
            .limit(4)
            .lean<PublicMember[]>()
            .exec();
    }

    public async getMemberDetail(member?: AuthMember): Promise<Member> {
        if (!member || !/^[a-f\d]{24}$/i.test(String(member._id))) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        }
        const result = await this.memberModel
            .findOne({ _id: member._id, memberStatus: MemberStatus.ACTIVE })
            .select("-memberPassword -__v")
            .lean()
            .exec();
        if (!result) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        return result;
    }

    public async updateMember(member: AuthMember | undefined, input: MemberProfileUpdateInput): Promise<Member> {
        if (!member || !/^[a-f\d]{24}$/i.test(String(member._id))) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        }
        validateMemberFields(input);
        const update: MemberProfileUpdateInput = {};
        for (const field of ["memberNick", "memberPhone", "memberAddress", "memberDesc", "memberImage"] as const) {
            if (input[field] !== undefined) update[field] = input[field]!.trim();
        }
        if (input.memberPassword !== undefined) {
            update.memberPassword = await bcrypt.hash(input.memberPassword, 10);
        }
        if (!Object.keys(update).length) throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
        try {
            const result = await this.memberModel
                .findOneAndUpdate(
                    { _id: member._id, memberStatus: MemberStatus.ACTIVE },
                    { $set: update },
                    { new: true, runValidators: true }
                )
                .select("-memberPassword -__v")
                .lean()
                .exec();
            if (!result) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
            return result;
        } catch (err) {
            if ((err as { code?: number }).code === 11000) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
            }
            throw err;
        }
    }

    // SSR
    public async processSignup(input: MemberInput): Promise<Member> {
        const exist = await this.memberModel
            .findOne({ memberType: MemberType.ADMIN })
            .exec();
        console.log("Exist Check Result:", exist);
        if (exist) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }


        const salt = await bcrypt.genSalt(10);
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);
            result.memberPassword = "";
            return result;
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async processLogin(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne(
                { memberNick: input.memberNick },
                { memberNick: 1, memberPassword: 1 })
            .exec();
        if (!member) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }

        if (!member.memberPassword) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);
        // const isMatch = input.memberPassword === member.memberPassword;



        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result = await this.memberModel.findById(member._id).exec();

        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }
        return result;

    }

    public async getUsers(): Promise<Member[]> {
        const result = await this.memberModel.find({ memberType: MemberType.USER }).exec();

        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }

    public async updateChosenUser( input: MemberUpdateInput): Promise<Member> {
        input._id = shapeIntoMongooseObjectid( input._id);
        const result = await this.memberModel
        .findByIdAndUpdate({ _id: input._id }, input, { new: true})
        .exec();

        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.NO_DATA_FOUND);

        return result;
    }
}


export default MemberService;
