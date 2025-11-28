import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { classificationService } from '../api/services';

/**
 * Resume Reviewer Tool
 * Provides AI-powered feedback on resumes
 */

const ResumeReviewer = () => {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setFeedback(null);
      setError('');
    }
  };

  const handleReview = async () => {
    if (!selectedFile || !jobTitle.trim()) {
      setError('Please provide both a resume file and target job title.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await classificationService.analyzeResume(selectedFile, jobTitle.trim());
      setFeedback(response?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong while analyzing the resume.');
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
        ← Back to Home
      </Link>

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center mb-4">
          <span className="text-5xl mr-4">📄</span>
          <h1 className="text-4xl font-bold text-gray-900">Resume Reviewer</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Get AI-powered feedback and actionable suggestions to improve your resume and land your dream job.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Resume</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Target Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Resume File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="resumeUpload"
                accept=".pdf,.doc,.docx,.txt"
              />
              <label htmlFor="resumeUpload" className="cursor-pointer">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-700 font-medium mb-2">
                  {fileName || 'Click to upload your resume'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, TXT (Max 5MB)
                </p>
                {fileName && (
                  <div className="mt-4 inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                    <span className="mr-2">✓</span>
                    <span className="font-medium">{fileName}</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
              {error}
            </div>
          )}

          <button
            onClick={handleReview}
            disabled={!selectedFile || !jobTitle.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Analyzing...' : 'Review Resume'}
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      {feedback && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resume Score</h2>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <span className="text-5xl font-bold">{feedback.overallScore ?? '--'}</span>
            </div>
            <p className="text-gray-600 mt-4">
              {feedback.overallScore >= 90 ? 'Excellent!' : feedback.overallScore >= 80 ? 'Great!' : 'Good!'}
            </p>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-green-500 mr-2">✓</span> Strengths
            </h3>
            <ul className="space-y-2">
              {(feedback.keyStrengths || []).map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-orange-500 mr-2">⚠</span> Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {(feedback.criticalWeaknesses || []).map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-blue-500 mr-2">💡</span> Top Priority Action
              </h3>
              <p className="text-gray-700">{feedback.topPriorityAction}</p>
            </div>

            {feedback.experienceAlignment && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Experience Alignment</h3>
                <p className="text-gray-700">{feedback.experienceAlignment}</p>
              </div>
            )}

            {feedback.skillGaps && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Skill Gaps</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {feedback.skillGaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.atsKeywords && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ATS Keywords to Emphasize</h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.atsKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {feedback.nextStepAdvice && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Next Step Advice</h3>
                <p className="text-gray-700">{feedback.nextStepAdvice}</p>
              </div>
            )}

            {feedback.metadata && (
              <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-1">
                {feedback.metadata.jobTitle && (
                  <p><span className="font-semibold">Job Title:</span> {feedback.metadata.jobTitle}</p>
                )}
                {feedback.metadata.fileName && (
                  <p><span className="font-semibold">File Name:</span> {feedback.metadata.fileName}</p>
                )}
                {feedback.metadata.analyzedAt && (
                  <p>
                    <span className="font-semibold">Analyzed:</span>{' '}
                    {new Date(feedback.metadata.analyzedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeReviewer;
