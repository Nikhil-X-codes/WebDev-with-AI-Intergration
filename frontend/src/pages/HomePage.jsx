import React from 'react';
import ToolCard from '../components/ToolCard';

/**
 * HomePage Component
 * Landing page displaying all AI tools in a grid layout
 */
const HomePage = () => {
  // Configuration for all AI tools
  const tools = [
    {
      id: 1,
      title: 'AI Article Writer',
      description: 'Generate high-quality articles on any topic with AI-powered content creation.',
      route: '/article-writer',
      icon: '📝'
    },
    {
      id: 2,
      title: 'Blog Title / Headline Generator',
      description: 'Create catchy, SEO-friendly blog titles and headlines instantly.',
      route: '/blog-title-generator',
      icon: '💡'
    },
    {
      id: 3,
      title: 'Quote / Tagline Generator',
      description: 'Generate inspiring quotes and memorable taglines for your brand.',
      route: '/quote-generator',
      icon: '✨'
    },
    {
      id: 4,
      title: 'Rewriter Tool',
      description: 'Rewrite and improve your content while maintaining the original meaning.',
      route: '/rewriter',
      icon: '🔄'
    },
    {
      id: 5,
      title: 'Resume Reviewer',
      description: 'Get AI-powered feedback and suggestions to improve your resume.',
      route: '/resume-reviewer',
      icon: '📄'
    },
    {
      id: 6,
      title: 'File Upload AI Chat Assistant',
      description: 'Upload documents and chat with AI to extract insights and answers.',
      route: '/file-upload-chat',
      icon: '💬'
    },
    {
      id: 7,
      title: 'AI Ticket Classifier',
      description: 'Automatically classify and prioritize support tickets using AI.',
      route: '/ticket-classifier',
      icon: '🎫'
    },
    {
      id: 8,
      title: 'AI Content Detector',
      description: 'Detect AI-generated content with advanced analysis and authenticity scoring.',
      route: '/ai-detector',
      icon: '🔍'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Productivity Toolkit
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Supercharge your productivity with our collection of AI-powered tools. 
          From content creation to document analysis, we've got everything you need to work smarter, not harder.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            route={tool.route}
            icon={tool.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
