import {Document, Schema, model, ObjectId} from "mongoose";
import { IUser } from "../types/userTypes";

export interface IUserDocument extends IUser, Document {
    _id: ObjectId,
    updatedAt: Date,
    createdAt: Date
}

const userSchema = new Schema<IUserDocument>({
    nickname: {
        type: String,
        required: [true, 'Nickname is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, { timestamps: true })

export default model<IUserDocument>('User', userSchema)