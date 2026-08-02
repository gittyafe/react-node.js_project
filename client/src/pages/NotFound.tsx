import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-3">עמוד לא נמצא</h1>
        <p className="text-gray-600 mb-6">הדף שאתה מחפש לא קיים או הועבר.</p>
        <Link to="/" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
};
