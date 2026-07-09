import React, { useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useDispatch, useSelector } from 'react-redux';
import { setExams } from '../store/store';
import { RootState } from '../store/store';

export default function ExamsList() {
    const { data, loading } = useFetch('/exams');
    const dispatch = useDispatch();
    const exams = useSelector((s: RootState) => s.exams.items);

    useEffect(() => {
        if (data && data.items) dispatch(setExams(data.items));
    }, [data, dispatch]);

    if (loading) return <div>Loading exams...</div>;

    return (
        <div>
            <h2>Exams</h2>
            <ul>
                {exams.map((e: any) => (
                    <li key={e.id}>{e.title}</li>
                ))}
            </ul>
        </div>
    );
}
