import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { classificationService } from '../api/services';

/**
 * AI Ticket Classifier Tool
 * Automatically classifies and prioritizes support tickets
 */
const TicketClassifier = () => {
  const [ticketText, setTicketText] = useState('');
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async () => {
    if (!ticketText.trim()) return;
    
    setLoading(true);
    try {
      const response = await classificationService.classifyTicket(
        ticketText,
        ''
      );
      
      // Extract classification data from response
      const classificationData = response.data?.classification || response.classification || response.data || {};
      
      const result = {
        category: classificationData.category || 'General Inquiry',
        priority: classificationData.priority || 'Medium',
        sentiment: classificationData.sentiment || 'Neutral',
        suggestedDepartment: classificationData.suggestedDepartment || classificationData.department || 'Customer Success',
        estimatedResponseTime: classificationData.estimatedResponseTime || classificationData.responseTime || '24 hours',
        keywords: classificationData.keywords || []
      };
      
      setClassification(result);
    } catch (error) {
      
      alert('Failed to classify ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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
          <span className="text-5xl mr-4">🎫</span>
          <h1 className="text-4xl font-bold text-gray-900">AI Ticket Classifier</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Automatically classify and prioritize support tickets using AI to streamline your customer service workflow.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ticket Details</h2>
        
        <div className="space-y-4">

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Ticket Content
            </label>
            <textarea
              value={ticketText}
              onChange={(e) => setTicketText(e.target.value)}
              placeholder="Enter the support ticket or customer message..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {ticketText.length} characters
            </p>
          </div>

          <button
            onClick={handleClassify}
            disabled={!ticketText || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Classifying...' : 'Classify Ticket'}
          </button>
        </div>
      </div>

      {/* Classification Results */}
      {classification && (
        <div className="space-y-6">
          {/* Main Classification Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Classification Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-xl font-semibold text-gray-900">{classification.category}</p>
              </div>

              {/* Priority */}
              <div className={`rounded-lg p-4 border ${getPriorityColor(classification.priority)}`}>
                <p className="text-sm mb-1">Priority</p>
                <p className="text-xl font-semibold">{classification.priority}</p>
              </div>

              {/* Sentiment */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Sentiment</p>
                <p className="text-xl font-semibold text-gray-900">{classification.sentiment}</p>
              </div>

              {/* Department */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Suggested Department</p>
                <p className="text-xl font-semibold text-gray-900">{classification.suggestedDepartment}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketClassifier;
