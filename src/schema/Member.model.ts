import mongoose, { Schema } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import { Member } from "../libs/types/member";

const MemberSchema = new Schema<Member>({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.USER
    },
    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },
    memberNick: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },
    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },
    memberPassword: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },
    memberImage: {
        type: String,
    },
    memberPoints: {
        type: Number,
        default: 0,
    },
    memberAddress: {
        type: String,
    },
    memberDesc: {
        type: String,
    },
},
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt', } }
)
export default mongoose.model<Member>("Members", MemberSchema);
