import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { assistantService } from '../api/services';

/**
 * File Upload AI Chat Assistant Tool
 * Upload documents and chat with AI to extract insights
 */

const FileUploadChat = () => {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setMessages([
        {
          role: 'system',
          content: `File "${file.name}" uploaded. Ask a question to analyze it.`
        }
      ]);
      setError('');
      setFileInfo(null);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedFile || !inputMessage.trim()) {
      setError('Upload a document and enter a question first.');
      return;
    }

    const userMessage = { role: 'user', content: inputMessage };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await assistantService.respondToQuery(selectedFile, inputMessage.trim());
      
      // Extract answer from response
      const answer = response.answer || response.response || response.data?.answer || response.data?.response || 'Response received';
      
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: answer }
      ]);
      setFileInfo(response.file_info || response.data?.file_info || null);
    } catch (err) {
      setMessages(nextMessages);
      setError(err.response?.data?.message || err.message || 'Document Q&A failed. Try again.');
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
          <span className="text-5xl mr-4">💬</span>
          <h1 className="text-4xl font-bold text-gray-900">File Upload AI Chat Assistant</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Upload documents and chat with AI to extract insights, summaries, and answers from your files.
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Document</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
            accept=".pdf,.doc,.docx,.txt"
          />
          <label htmlFor="fileUpload" className="cursor-pointer">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-700 font-medium mb-2">
              {fileName || 'Click to upload a document'}
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, TXT
            </p>
          </label>
        </div>
      </div>

      {/* Chat Section */}
      {fileName && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chat with Your Document</h2>
          
          {/* Messages Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto border border-gray-200">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.role === 'system'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block bg-gray-200 text-gray-800 p-3 rounded-lg">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about your document..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Send
            </button>
          </div>

          {fileInfo && (
            <div className="mt-4 text-sm text-gray-600 space-y-1 border-t border-gray-200 pt-4">
              <p><span className="font-semibold">File:</span> {fileInfo.name}</p>
              <p><span className="font-semibold">Size:</span> {(fileInfo.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p><span className="font-semibold">Type:</span> {fileInfo.type}</p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Try asking:</p>
            <ul className="space-y-1">
              <li>• "Give me a summary of this document"</li>
              <li>• "What are the main points?"</li>
              <li>• "Extract key statistics from this file"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadChat;
