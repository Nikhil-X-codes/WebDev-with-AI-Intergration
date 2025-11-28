import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { textGenerationService } from '../api/services';

/**
 * Blog Title / Headline Generator Tool
 * Generates catchy blog titles and headlines
 */
const BlogTitleGenerator = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const { titles } = await textGenerationService.generateTitles(topic, tone, 10);
      setResults(titles);
    } catch (error) {
      
      alert('Failed to generate titles. Please try again.');
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
          <span className="text-5xl mr-4">💡</span>
          <h1 className="text-4xl font-bold text-gray-900">Blog Title / Headline Generator</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Create catchy, SEO-friendly blog titles and headlines that grab attention and drive clicks.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate Titles</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Blog Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your blog topic..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="educational">Educational</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Generating...' : 'Generate Titles'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generated Titles</h2>
          <div className="space-y-3">
            {results.map((title, index) => (
              <div
                key={index}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 transition-colors cursor-pointer"
                onClick={() => navigator.clipboard.writeText(title)}
              >
                <p className="text-gray-800 font-medium">{index + 1}. {title}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            💡 Click any title to copy it to clipboard
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogTitleGenerator;
