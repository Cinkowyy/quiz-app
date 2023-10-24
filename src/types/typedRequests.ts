import { Request } from "express"

export interface AuthorizedRequest extends Request {
    userId?: string
}

export interface TypedRequest<T> extends AuthorizedRequest {
    body: T
}