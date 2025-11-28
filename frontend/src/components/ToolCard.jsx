import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ToolCard Component
 * Reusable card component for displaying AI tool information on the homepage
 * @param {string} title - Tool name
 * @param {string} description - Short description of the tool
 * @param {string} route - Navigation route for the tool
 * @param {string} icon - Icon/emoji for the tool
 */
const ToolCard = ({ title, description, route, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full border border-gray-200 hover:border-blue-400">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      <Link 
        to={route}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
      >
        Open Tool
      </Link>
    </div>
  );
};

export default ToolCard;
