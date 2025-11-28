import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { aiDetectionService } from '../api/services';


const AIDetector = () => {
  const { isSignedIn, user } = useUser();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    
    try {
      // Call backend API
      const response = await aiDetectionService.detectContent(inputText);
      
      // Extract detection data from response
      const detection = response.data.detection;
      
      // Convert probabilities from 0-1 to 0-100 for display
      detection.aiProbability = Math.round(detection.aiProbability * 100);
      detection.humanProbability = Math.round(detection.humanProbability * 100);
      
      // Use analysis data from backend response
      detection.analysis = response.data.analysis || {
        sentenceComplexity: 75,
        vocabularyDiversity: 80,
        naturalFlow: 70,
        contextualCoherence: 85,
      };
      
      // Use indicators from backend
      detection.indicators = response.data.indicators || [];

      setResult(detection);
    } catch (error) {
      
      alert('Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict.includes('AI-Generated')) return 'text-red-600';
    if (verdict.includes('Mixed')) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getVerdictBgColor = (verdict) => {
    if (verdict.includes('AI-Generated')) return 'bg-red-50 border-red-300';
    if (verdict.includes('Mixed')) return 'bg-yellow-50 border-yellow-300';
    return 'bg-green-50 border-green-300';
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
          <span className="text-5xl mr-4">🔍</span>
          <h1 className="text-4xl font-bold text-gray-900">AI Content Detector</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Detect AI-generated content with advanced analysis. Get detailed insights about text authenticity and origin.
        </p>
        {isSignedIn && (
          <div className="mt-4 flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-blue-600 mr-2">👤</span>
            <span className="text-blue-800 font-medium">
              Signed in as: {user?.emailAddresses[0]?.emailAddress || user?.username}
            </span>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analyze Text</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Analyze
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type the text you want to check for AI generation..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {inputText.length} characters | {inputText.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
              <p className="text-sm text-gray-500">
                Minimum 50 words recommended for accurate detection
              </p>
            </div>
          </div>

          <button
            onClick={handleDetect}
            disabled={!inputText.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Detect AI Content'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div className={`rounded-lg shadow-lg p-8 border-2 ${getVerdictBgColor(result.verdict)}`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Detection Result</h2>
              <p className={`text-4xl font-bold mb-4 ${getVerdictColor(result.verdict)}`}>
                {result.verdict}
              </p>
              <p className="text-gray-700 text-lg">
                Confidence Level: <span className="font-semibold">{result.confidence}</span>
              </p>
            </div>
          </div>

          {/* Probability Scores */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Probability Scores</h3>
            
            <div className="space-y-4">
              {/* AI Probability */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">AI-Generated</span>
                  <span className="text-gray-900 font-bold">{result.aiProbability}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${result.aiProbability}%` }}
                  ></div>
                </div>
              </div>

              {/* Human Probability */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Human-Written</span>
                  <span className="text-gray-900 font-bold">{result.humanProbability}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${result.humanProbability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Detailed Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 font-medium mb-2">Sentence Complexity</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${result.analysis.sentenceComplexity}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{result.analysis.sentenceComplexity}%</span>
                </div>
              </div>

              <div>
                <p className="text-gray-700 font-medium mb-2">Vocabulary Diversity</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${result.analysis.vocabularyDiversity}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{result.analysis.vocabularyDiversity}%</span>
                </div>
              </div>

              <div>
                <p className="text-gray-700 font-medium mb-2">Natural Flow</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${result.analysis.naturalFlow}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{result.analysis.naturalFlow}%</span>
                </div>
              </div>

              <div>
                <p className="text-gray-700 font-medium mb-2">Contextual Coherence</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full"
                      style={{ width: `${result.analysis.contextualCoherence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{result.analysis.contextualCoherence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Key Indicators</h3>
            <ul className="space-y-2">
              {result.indicators.map((indicator, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{indicator}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const report = `AI Content Detection Report\n\nVerdict: ${result.verdict}\nConfidence: ${result.confidence}\n\nAI Probability: ${result.aiProbability}%\nHuman Probability: ${result.humanProbability}%\n\nAnalyzed Text:\n${inputText}`;
                  navigator.clipboard.writeText(report);
                  alert('Report copied to clipboard!');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Copy Report
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setInputText('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDetector;
