import { Request } from "express"

export interface RequestWithUserId extends Request {
    userId?: string
}

export interface TypedRequest<T> extends RequestWithUserId {
    body: T
}