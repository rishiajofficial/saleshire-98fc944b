
import React from 'react';

interface TrainingHeaderProps {
  jobTitle: string | undefined;
}

const TrainingHeader = ({ jobTitle }: TrainingHeaderProps) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Training Center</h1>
      {jobTitle && (
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h2 className="font-semibold text-blue-800">Training for: {jobTitle}</h2>
          <p className="text-sm text-gray-600">
            Complete the following training modules and assessments.
          </p>
        </div>
      )}
    </>
  );
};

export default TrainingHeader;
