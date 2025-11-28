import apiClient from './axios';

/**
 * AI Detection Services
 */
export const aiDetectionService = {
  // Detect AI-generated content
  detectContent: async (text) => {
    const response = await apiClient.post('/api/ai/detect', { text });
    return response.data;
  },
};

/**
 * Text Generation Services
 */
export const textGenerationService = {
  // Generate article
  generateArticle: async (topic, keywords, wordCount) => {
    const response = await apiClient.post('/api/generate/article', {
      topic,
      keywords,
      wordCount,
    });
    return response.data;
  },

  // Generate SEO-friendly titles
  generateTitles: async (topic, tone = 'professional', count = 5) => {
    const response = await apiClient.post('/api/generate/titles', {
      topic,
      tone,
      count,
    });
    // Backend may return either an array of titles or an object containing them.
    const data = response.data;
    if (Array.isArray(data)) {
      return { titles: data };
    }
    // Normalize possible shapes: { titles: [...] } or full apiResponse
    if (data && Array.isArray(data.titles)) {
      return { titles: data.titles };
    }
    // Fallback: attempt to extract lines if it's a string
    if (typeof data === 'string') {
      const titles = data
        .split('\n')
        .map(l => l.replace(/^\d+[).\-\s]*/, '').trim())
        .filter(Boolean);
      return { titles };
    }
    return { titles: [] };
  },

  // Generate inspirational quotes
  generateQuotes: async (theme, type = 'inspirational', count = 5) => {
    const response = await apiClient.post('/api/generate/quotes', {
      theme,
      type,
      count,
    });
    return response.data;
  },

  // Rewrite text with different tone
  rewriteText: async (text, mode = 'standard') => {
    const response = await apiClient.post('/api/generate/rewrite', {
      text,
      mode,
    });
    return response.data;
  },
};

/**
 * Classification Services
 */
export const classificationService = {
  // Classify support ticket
  classifyTicket: async (text, userId = '') => {
    const response = await apiClient.post('/api/classify/ticket', {
      text,
      userId,
    });
    return response.data;
  },

  // Analyze resume with file upload
  analyzeResume: async (file, jobTitle) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobTitle', jobTitle);

    const response = await apiClient.post('/api/classify/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Analyze sentiment
  analyzeSentiment: async (text) => {
    const response = await apiClient.post('/api/classify/sentiment', { text });
    return response.data;
  },
};

/**
 * Assistant Services
 */
export const assistantService = {
  // Document Q&A assistant with file upload
  respondToQuery: async (file, userInput) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_input', userInput);

    const response = await apiClient.post('/api/assistant/respond', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Export all services as a single object
export default {
  aiDetection: aiDetectionService,
  textGeneration: textGenerationService,
  classification: classificationService,
  assistant: assistantService,
};
