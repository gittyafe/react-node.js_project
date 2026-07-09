import React from 'react';

export default function QuestionCard({ question, onAnswer }: any) {
    return (
        <div style={{ border: '1px solid #ddd', padding: 8, margin: 8 }}>
            <div>{question.text}</div>
            {question.options && question.options.map((opt: string) => (
                <div key={opt}>
                    <label>
                        <input type="radio" name={question.id} value={opt} onChange={(e) => onAnswer(e.target.value)} /> {opt}
                    </label>
                </div>
            ))}
            {!question.options && (
                <div>
                    <input onChange={(e) => onAnswer(e.target.value)} />
                </div>
            )}
        </div>
    );
}
