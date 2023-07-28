import mongoose from "mongoose";

export interface IUserDocument extends mongoose.Document{
    nickname: string
    email: string
    password: string 
}


const userSchema = new mongoose.Schema<IUserDocument>({
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

export default mongoose.model<IUserDocument>('User', userSchema)