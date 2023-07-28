import { Schema, model, Document, ObjectId } from "mongoose";
import { IQuiz } from "../types/quizTypes";

export interface IQuizDocument extends IQuiz ,Document {
    _id: ObjectId
    updatedAt: Date,
    createdAt: Date
}

const quizSchema = new Schema<IQuizDocument>({
    title: { type: String, required: true },
    questions: {
        type: Map,
        of: new Schema({
            content: { type: String, required: true },
            answers: {
                type: Map,
                of: String,
                required: true,
            },
            correctAnswer: { type: Number, required: true },
        }),
        required: true
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true })

export default model<IQuizDocument>('Quiz', quizSchema)
