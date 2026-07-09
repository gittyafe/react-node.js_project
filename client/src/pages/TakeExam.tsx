import React, { useReducer, useMemo, useRef } from 'react';
import QuestionCard from '../components/QuestionCard';

type State = { answers: Record<string, any> };

function reducer(state: State, action: any) {
    switch (action.type) {
        case 'answer':
            return { ...state, answers: { ...state.answers, [action.qid]: action.answer } };
        default:
            return state;
    }
}

export default function TakeExam({ questions = [] as any[] }) {
    const [state, dispatch] = useReducer(reducer, { answers: {} });
    const startRef = useRef(Date.now());

    const totalPoints = useMemo(() => {
        return questions.reduce((s, q) => s + (q.points || 0), 0);
    }, [questions]);

    return (
        <div>
            <h2>Take Exam</h2>
            <div>Total points: {totalPoints}</div>
            {questions.map((q) => (
                <QuestionCard
                    key={q.id}
                    question={q}
                    onAnswer={(ans: any) => dispatch({ type: 'answer', qid: q.id, answer: ans })}
                />
            ))}
            <div>Started at: {new Date(startRef.current).toLocaleString()}</div>
        </div>
    );
}
