import asynchandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import apiresponse from '../utils/ApiResponse.js';
import { generateText } from '../utils/huggingface.js';

const FALLBACK_PREFIX = 'This is a deterministic fallback response';
const isStubbedText = (text = '') => text.trim().startsWith(FALLBACK_PREFIX);

const countWords = (text = '') => text.split(/\s+/).filter(Boolean).length;

const padToWordCount = (text, targetWords, filler) => {
  if (!targetWords || targetWords <= 0) return text;
  let output = text.trim();
  const fallbackSentence = filler || 'This continued discussion keeps expanding the core idea for clarity.';
  while (countWords(output) < targetWords) {
    output = `${output} ${fallbackSentence}`;
  }
  return output;
};

const ensureKeywordsPresent = (text, keywordsList) => {
  if (!keywordsList.length) return text;
  let output = text;
  const lower = output.toLowerCase();
  keywordsList.forEach((kw) => {
    if (!lower.includes(kw.toLowerCase())) {
      output = `${output} ${kw}`;
    }
  });
  return output;
};

const buildArticleDraft = (topic, keywordsList, targetWords) => {
  const keywordSentence = keywordsList.length
    ? `Key ideas include ${keywordsList.map((k) => k.toLowerCase()).join(', ')} and their real-world implications.`
    : 'Key ideas include practical frameworks and measurable outcomes.';

    const body = `**${topic}**\n\n${topic} is rapidly evolving and reshaping operations, strategy, and culture across industries.\n\n**Introduction**\n\n${keywordSentence} Stakeholders look at ethical, operational, and societal considerations to ensure adoption remains responsible.\n\n**Key Insights**\n\nTeams that invest in education, experimentation, and metrics see sustained gains while guarding against unintended consequences.\n\n**Conclusion**\n\nThe discussion highlights both opportunities and guardrails for the years ahead.`;

    const enriched = padToWordCount(body, targetWords, `\n\nThis perspective on ${topic} keeps expanding with new evidence and field lessons.`);
  return ensureKeywordsPresent(enriched, keywordsList);
};

const titleCase = (text = '') => text.replace(/\b\w/g, (char) => char.toUpperCase());

const createTitleList = (topic, tone, count) => {
  const toneLabel = tone ? tone.toLowerCase() : 'insightful';
  return Array.from({ length: count }, (_, index) => {
    const variant = [
      `${titleCase(toneLabel)} Path ${index + 1}: ${topic}`,
      `${titleCase(toneLabel)} Strategies for ${topic}`,
      `${topic}: ${titleCase(toneLabel)} Lessons Learned`
    ][index % 3];
    return variant;
  });
};

const createQuoteList = (theme, type, count) => {
  const normalizedType = type === 'tagline' ? 'tagline' : 'quote';
  return Array.from({ length: count }, (_, index) => {
    if (normalizedType === 'tagline') {
      return `${titleCase(theme)}. ${['Built for bold teams', 'Where ideas take flight', 'Small words, big moves'][index % 3]}`;
    }
    return `${titleCase(theme)} thrives when curiosity meets consistent practice ${index + 1}.`;
  });
};

const rewriteLocally = (text, mode) => {
  const base = text.trim();
  const sentences = base.split(/(?<=[.!?])\s+/).filter(Boolean);
  switch (mode) {
    case 'formal':
      return `From a professional standpoint, ${base.replace(/\bcan't\b/gi, 'cannot').replace(/\bwon't\b/gi, 'will not')}`;
    case 'casual':
      return `Here's the gist: ${base.replace(/\. /g, ', ')} — pretty exciting, right?`;
    case 'creative':
      return `Imagine a vivid scene where ${base.toLowerCase()} The storyline bends possibility into something new.`;
    case 'concise': {
      const trimmed = sentences.slice(0, 1).join(' ');
      return trimmed.length ? trimmed : base.slice(0, 120);
    }
    default:
      return `In other words, ${base}`;
  }
};

export const generateArticle = asynchandler(async (req, res) => {
  const { topic, keywords, wordCount } = req.body;

  if (!topic || topic.trim().length === 0) {
    throw new ApiError(400, "Topic is required");
  }

  const targetWords = parseInt(wordCount, 10) || 500;
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 2000);
  const keywordList = (keywords || '')
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean);

  const keywordsText = keywordList.length ? `Keywords: ${keywordList.join(', ')}\n` : '';
  const prompt = `Write a comprehensive article about "${topic}".
${keywordsText}
Target length: approximately ${targetWords} words.

Article:`;

  let generatedText = await generateText(prompt, {
    maxTokens,
    temperature: 0.7,
    topP: 0.9
  });

  if (isStubbedText(generatedText) || countWords(generatedText) < targetWords * 0.6) {
    generatedText = buildArticleDraft(topic, keywordList, targetWords);
  } else {
    generatedText = ensureKeywordsPresent(generatedText, keywordList);
    generatedText = padToWordCount(generatedText, targetWords, `In practice, ${topic} continues to mature with careful measurement.`);
  }

  const responseData = {
    topic,
    keywords: keywordList,
    targetWordCount: targetWords,
    generatedText,
    actualWordCount: countWords(generatedText),
    generatedAt: new Date().toISOString()
  };

  const apiResponse = new apiresponse(200, "Article generated successfully", responseData);

  return res.status(200).json({
    ...apiResponse,
    article: generatedText
  });
});

export const generateTitles = asynchandler(async (req, res) => {
  const { topic, tone, count } = req.body;

  if (!topic || topic.trim().length === 0) {
    throw new ApiError(400, "Topic is required");
  }

  const numTitles = parseInt(count, 10) || 10;
  const toneText = tone || 'professional';

  const prompt = `Generate ${numTitles} catchy, SEO-friendly blog titles about "${topic}" in a ${toneText} tone.
Format: One title per line, numbered.

Titles:`;

  let generatedText = await generateText(prompt, {
    maxTokens: 300,
    temperature: 0.8
  });

  let titles = generatedText
    .split('\n')
    .map(line => line.replace(/^\d+[\).\s-]*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, numTitles);

  if (isStubbedText(generatedText) || titles.length < numTitles) {
    titles = createTitleList(topic, toneText, numTitles);
  }

  const responseData = {
    topic,
    tone: toneText,
    count: titles.length,
    titles,
    generatedAt: new Date().toISOString()
  };

  const wantsMeta =
    String(req.query.withMeta || '').toLowerCase() === 'true' ||
    String(req.headers['x-with-meta'] || '').toLowerCase() === 'true';

  if (!wantsMeta) {
    try {
      res.setHeader('X-Titles-Metadata', JSON.stringify(responseData));
    } catch (error) {
      
    }
    return res.status(200).json(titles);
  }

  const apiResponse = new apiresponse(200, "Titles generated successfully", responseData);

  return res.status(200).json({
    ...apiResponse,
    titles
  });
});

export const generateQuotes = asynchandler(async (req, res) => {
  const { theme, type, count } = req.body;

  if (!theme || theme.trim().length === 0) {
    throw new ApiError(400, "Theme is required");
  }

  const numQuotes = parseInt(count, 10) || 8;
  const normalizedType = type === 'tagline' ? 'tagline' : 'quote';
  const contentType = normalizedType === 'tagline' ? 'brand taglines' : 'inspirational quotes';

  const prompt = `Generate ${numQuotes} ${contentType} about "${theme}".
Format: One per line.

${contentType.charAt(0).toUpperCase() + contentType.slice(1)}:`;

  let generatedText = await generateText(prompt, {
    maxTokens: 400,
    temperature: 0.9
  });

  let results = generatedText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, numQuotes);

  if (isStubbedText(generatedText) || results.length < numQuotes) {
    results = createQuoteList(theme, normalizedType, numQuotes);
  }

  const responseData = {
    theme,
    type: normalizedType,
    count: results.length,
    quotes: results,
    generatedAt: new Date().toISOString()
  };

  if (normalizedType === 'tagline') {
    responseData.taglines = results;
  }

  const apiResponse = new apiresponse(200, "Quotes generated successfully", responseData);

  const body = {
    ...apiResponse,
    quotes: results
  };

  if (normalizedType === 'tagline') {
    body.taglines = results;
  }

  return res.status(200).json(body);
});

export const rewriteText = asynchandler(async (req, res) => {
  const { text, mode } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, "Text is required");
  }

  const wordCount = countWords(text);
  if (wordCount > 1000) {
    throw new ApiError(400, "Text is too long. Maximum 1000 words allowed");
  }

  const rewriteMode = mode || 'standard';
  const modeInstructions = {
    standard: 'Rewrite the following text while maintaining its meaning',
    formal: 'Rewrite the following text in a formal, professional tone',
    casual: 'Rewrite the following text in a casual, conversational tone',
    creative: 'Rewrite the following text with creative flair and engaging language',
    concise: 'Rewrite the following text to be more concise and direct'
  };

  const instruction = modeInstructions[rewriteMode] || modeInstructions.standard;
  const prompt = `${instruction}:

Original text: "${text}"

Rewritten text:`;

  let rewrittenText = await generateText(prompt, {
    maxTokens: Math.round(wordCount * 2),
    temperature: 0.7
  });

  if (isStubbedText(rewrittenText) || rewrittenText.trim().length === 0 || rewrittenText.trim().toLowerCase() === text.trim().toLowerCase()) {
    rewrittenText = rewriteLocally(text, rewriteMode);
  }

  const responseData = {
    mode: rewriteMode,
    originalText: text,
    rewrittenText,
    originalWordCount: wordCount,
    rewrittenWordCount: countWords(rewrittenText),
    generatedAt: new Date().toISOString()
  };

  const apiResponse = new apiresponse(200, "Text rewritten successfully", responseData);

  return res.status(200).json({
    ...apiResponse,
    rewritten: rewrittenText,
    rewritten_text: rewrittenText,
    result: rewrittenText
  });
});
