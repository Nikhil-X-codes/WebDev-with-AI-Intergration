import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { textGenerationService } from '../api/services';

/**
 * Quote / Tagline Generator Tool
 * Generates inspiring quotes and memorable taglines
 */
const QuoteGenerator = () => {
  const [theme, setTheme] = useState('');
  const [type, setType] = useState('quote');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    
    setLoading(true);
    try {
      const response = await textGenerationService.generateQuotes(theme, type, 8);
      
      // Extract quotes from response
      const quotes = response.quotes || response.data?.quotes || [];
      
      setResults(quotes);
    } catch (error) {
      
      alert('Failed to generate quotes. Please try again.');
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
          <span className="text-5xl mr-4">✨</span>
          <h1 className="text-4xl font-bold text-gray-900">Quote / Tagline Generator</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Generate inspiring quotes and memorable taglines for your brand, business, or personal projects.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate Content</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Theme / Keyword
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., success, innovation, leadership"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="quote"
                  checked={type === 'quote'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">Inspirational Quote</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="tagline"
                  checked={type === 'tagline'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">Brand Tagline</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!theme || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Generating...' : `Generate ${type === 'quote' ? 'Quotes' : 'Taglines'}`}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Generated {type === 'quote' ? 'Quotes' : 'Taglines'}
          </h2>
          <div className="space-y-3">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg p-6 border border-blue-200 transition-all cursor-pointer"
                onClick={() => navigator.clipboard.writeText(item)}
              >
                <p className="text-gray-800 text-lg font-medium text-center italic">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            💡 Click any item to copy it to clipboard
          </p>
        </div>
      )}
    </div>
  );
};

export default QuoteGenerator;
