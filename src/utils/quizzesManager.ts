type RawQuestion = {
    id: string;
    answers: {
        id: string;
        isCorrect: boolean;
    }[];
};

type RawUserAnswer = {
    questionId: string;
    answerId: string;
};

type MappedQuestion = {
    questionId: string;
    correctAnswers: string[];
};

type MappedUserAnswer = {
    questionId: string;
    answers: string[];
};

const prepareData = (
    rawQuestions: RawQuestion[],
    rawUserAnswers: RawUserAnswer[],
): {
    questions: MappedQuestion[];
    userAnswers: MappedUserAnswer[];
} => {
    const mappedQuestions = rawQuestions.map((question) => {
        const correctAnswerIds = question.answers
            .filter((answer) => answer.isCorrect)
            .map((answer) => answer.id);

        return {
            questionId: question.id,
            correctAnswers: correctAnswerIds,
        };
    });

    const mappedUserAnswers: MappedUserAnswer[] = [];

    rawUserAnswers.forEach((userAnswer) => {
        const existingUserAnswer = mappedUserAnswers.find(
            (userAnswer) => userAnswer.questionId === userAnswer.questionId
        );

        if (existingUserAnswer)
            existingUserAnswer.answers.push(userAnswer.answerId);
        else {
            mappedUserAnswers.push({
                questionId: userAnswer.questionId,
                answers: [userAnswer.answerId],
            });
        }
    });

    return {
        questions: mappedQuestions,
        userAnswers: mappedUserAnswers,
    };
};

export const calculateScore = (
    rawQuestions: RawQuestion[],
    rawUserAnswers: RawUserAnswer[]
) => {
    const { questions, userAnswers } = prepareData(rawQuestions, rawUserAnswers);

    const maxScore = questions.length;

    const userScore = userAnswers.reduce((totalScore, userAnswer) => {
        const question = questions.find(
            (q) => q.questionId === userAnswer.questionId
        );

        if (
            question &&
            userAnswer.answers.length === question.correctAnswers.length &&
            userAnswer.answers.every(
                (value, index) => value === question.correctAnswers[index]
            )
        )
            totalScore += 1;

        return totalScore;
    }, 0);

    return {
        userScore,
        maxScore,
    };
};
