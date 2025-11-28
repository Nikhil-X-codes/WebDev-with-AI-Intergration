import asynchandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import apiresponse from '../utils/ApiResponse.js';
import { detectAIContent } from '../utils/huggingface.js';

const toPercent = (value) => Math.min(100, Math.max(0, Math.round(value * 100)));

export const detectContent = asynchandler(async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    throw new ApiError(400, "Text is required and must be a string");
  }

  if (text.trim().length === 0) {
    throw new ApiError(400, "Text cannot be empty");
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 10) {
    throw new ApiError(400, "Text must contain at least 10 words for accurate analysis");
  }

  if (wordCount > 5000) {
    throw new ApiError(400, "Text is too long. Maximum 5000 words allowed");
  }

  const detectionResult = await detectAIContent(text);

  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = wordCount / sentenceCount;
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount;

  const aiPercent = detectionResult.aiProbability * 100;

  let verdict, confidence, indicators;
  
  if (aiPercent >= 70) {
    verdict = 'Likely AI-Generated';
    confidence = 'High';
    indicators = [
      'High confidence of AI-generated patterns',
      'Consistent structural patterns detected',
      'Limited contextual variation',
      'Formulaic language style'
    ];
  } else if (aiPercent >= 40) {
    verdict = 'Possibly Mixed Content';
    confidence = 'Medium';
    indicators = [
      'Mixed indicators of AI and human writing',
      'Some AI-like patterns present',
      'Moderate structural consistency',
      'Varying language complexity'
    ];
  } else {
    verdict = 'Likely Human-Written';
    confidence = 'High';
    indicators = [
      'Natural language variation detected',
      'Diverse sentence structures',
      'Authentic contextual flow',
      'Human-like stylistic elements'
    ];
  }

  const responseData = {
    detection: {
      aiProbability: Number(detectionResult.aiProbability.toFixed(4)),
      humanProbability: Number(detectionResult.humanProbability.toFixed(4)),
      verdict,
      confidence
    },
    analysis: {
      sentenceComplexity: Math.min(100, Math.round(avgSentenceLength * 3)),
      vocabularyDiversity: Math.min(100, Math.round((avgWordLength - 3) * 20)),
      naturalFlow: Math.max(0, Math.round(100 - (aiPercent * 0.8))),
      contextualCoherence: 75,
      sentiment: { label: 'neutral', score: 50 }
    },
    indicators,
    metadata: {
      textLength: text.length,
      wordCount,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      aiProbabilityPercent: toPercent(detectionResult.aiProbability),
      analyzedAt: new Date().toISOString()
    }
  };

  const apiResponse = new apiresponse(
    200,
    "AI content detection completed successfully",
    responseData
  );

  return res.status(200).json(apiResponse);
});
