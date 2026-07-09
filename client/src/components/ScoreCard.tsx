import React from 'react';

export default function ScoreCard({ score, total }: any) {
    return (
        <div style={{ border: '1px solid #444', padding: 12 }}>
            <div>Score: {score} / {total}</div>
            <div>Percent: {total ? Math.round((score / total) * 100) : 0}%</div>
        </div>
    );
}
