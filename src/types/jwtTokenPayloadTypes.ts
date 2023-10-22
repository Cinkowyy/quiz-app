import { JwtPayload } from "jsonwebtoken"

export interface IJwtTokenPayload extends JwtPayload{
    sub: string
}
