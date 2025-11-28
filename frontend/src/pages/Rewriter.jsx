import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { textGenerationService } from '../api/services';

/**
 * Rewriter Tool
 * Rewrites content while maintaining original meaning
 */
const Rewriter = () => {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('standard');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const response = await textGenerationService.rewriteText(inputText, mode);
      
      // Extract rewritten text from response (handle nested structure)
      const findRewrittenText = (obj) => {
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'object' && obj !== null) {
          for (const key of ['rewrittenText', 'text', 'content', 'result']) {
            if (obj[key]) return findRewrittenText(obj[key]);
          }
          for (const value of Object.values(obj)) {
            const result = findRewrittenText(value);
            if (result && typeof result === 'string') return result;
          }
        }
        return null;
      };
      
      const rewritten = findRewrittenText(response) || 'Text rewritten successfully!';
      setResult(rewritten);
    } catch (error) {
      
      alert('Failed to rewrite text. Please try again.');
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
          <span className="text-5xl mr-4">🔄</span>
          <h1 className="text-4xl font-bold text-gray-900">Rewriter Tool</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Rewrite and improve your content while maintaining the original meaning and intent.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Original Text</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter text to rewrite
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {inputText.length} characters
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Rewriting Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="standard">Standard</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
              <option value="concise">Concise</option>
            </select>
          </div>

          <button
            onClick={handleRewrite}
            disabled={!inputText || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Rewriting...' : 'Rewrite Text'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rewritten Text</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <pre className="whitespace-pre-wrap text-gray-800 font-sans">{result}</pre>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                setInputText(result.split('\n\n')[1] || result);
                setResult('');
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Use as Input
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewriter;
