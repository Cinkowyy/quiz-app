import { Request } from "express"
import { JwtPayload } from "jsonwebtoken"

export interface TypedRequest<T> extends Request {
    body: T
}

export interface IJwtTokenPayload extends JwtPayload{
    id: string
}
