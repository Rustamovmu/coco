import { AUTH_TIMER } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { AuthMember, Member } from "../libs/types/member";
import  Jwt  from "jsonwebtoken";

class AuthService {
    private readonly secretToken;
    constructor() {
        this.secretToken =     process.env.SECRET_TOKEN as string;
    }

    public createToken(member: Member) : Promise<string> {
        return new Promise((resolve, reject) => {
            const duration = `${AUTH_TIMER}h`;
            const payload: AuthMember = {
                _id: member._id,
                memberNick: member.memberNick,
                memberType: member.memberType,
                memberStatus: member.memberStatus,
            };
            Jwt.sign(
                payload,
                process.env.SECRET_TOKEN as string,
                {
                    expiresIn: duration,
                },
                (err, token) => {
                    if (err)
                        reject(
                            new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED)
                        );
                    else resolve(token as string);
                }
            );
        });
    }


    public async checkAuth(token: string): Promise<AuthMember>{
        try {
            const result: AuthMember = Jwt.verify(
                token,
                this.secretToken
            ) as Member;
            console.log(`-----[AUTH] memberNick: ${result.memberNick}------`);
            return result;
        } catch (err) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        }
    }    
}



export default AuthService;
