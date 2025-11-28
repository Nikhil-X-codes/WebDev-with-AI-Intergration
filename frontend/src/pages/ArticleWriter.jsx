import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { textGenerationService } from '../api/services';
import ReactMarkdown from 'react-markdown';


const ArticleWriter = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [wordCount, setWordCount] = useState('500');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const response = await textGenerationService.generateArticle(
        topic,
        keywords,
        parseInt(wordCount)
      );
      
      // Extract article from response (check multiple possible keys)
      const articleText = response.article || response.content || response.text || 
                         (response.data && (response.data.article || response.data.content || response.data.text));
      
      setResult(articleText || 'Article generated successfully!');
    } catch (error) {
      
      alert('Failed to generate article. Please try again.');
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
          <span className="text-5xl mr-4">📝</span>
          <h1 className="text-4xl font-bold text-gray-900">AI Article Writer</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Generate high-quality, engaging articles on any topic with AI-powered content creation.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Article Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Topic / Title
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your article topic..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Keywords (comma separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., technology, innovation, AI"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Target Word Count
            </label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="300">300 words</option>
              <option value="500">500 words</option>
              <option value="750">750 words</option>
              <option value="1000">1000 words</option>
              <option value="1500">1500 words</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Generating...' : 'Generate Article'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generated Article</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 prose prose-lg max-w-none">
              <div className="text-gray-800">
                {result.split('\n').map((line, index) => {
                  // Handle bold headings **text**
                  if (line.trim().match(/^\*\*(.+?)\*\*$/)) {
                    const text = line.trim().replace(/^\*\*|\*\*$/g, '');
                    return (
                      <h2 key={index} className="text-2xl font-bold mb-3 mt-5">
                        {text}
                      </h2>
                    );
                  }
                  // Handle inline bold text
                  else if (line.includes('**')) {
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={index} className="mb-4 leading-relaxed">
                        {parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  }
                  // Empty lines
                  else if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  // Regular paragraphs
                  else {
                    return (
                      <p key={index} className="mb-4 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                })}
              </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleWriter;
