import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const isHfConfigured = Boolean(process.env.HUGGINGFACE_API_KEY?.trim());
const hf = isHfConfigured ? new HfInference(process.env.HUGGINGFACE_API_KEY) : null;

const normalizeProbability = (value) => {
  const clamped = Math.min(1, Math.max(0, value));
  return Number(clamped.toFixed(4));
};

const heuristicDetection = (text) => {
  const words = text.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const uniqueRatio = words.length === 0 ? 0 : uniqueWords / words.length;
  const sentenceCount = Math.max(1, text.split(/[.!?]+/).filter((s) => s.trim()).length);
  const avgSentenceLength = words.length / sentenceCount;
  const aiScoreSeed = 0.35 + avgSentenceLength * 0.01 - uniqueRatio * 0.2;
  const aiProbability = normalizeProbability(aiScoreSeed);
  const humanProbability = normalizeProbability(1 - aiProbability);
  return {
    aiProbability,
    humanProbability,
    rawScores: null,
    source: 'heuristic'
  };
};

const fallbackGenerateText = (promptOrMessages) => {
  const basePrompt = Array.isArray(promptOrMessages)
    ? promptOrMessages
        .map((msg) => {
          if (!msg || typeof msg !== 'object') return '';
          return `${msg.role || 'user'}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`;
        })
        .join('\n')
    : String(promptOrMessages || '');

  const trimmed = basePrompt.replace(/\s+/g, ' ').trim();
  const summary = trimmed.slice(0, 320);
  return `This is a deterministic fallback response generated locally for testing.\nContext: ${summary}`;
};

export const MODELS = {
  AI_DETECTOR: 'openai-community/roberta-base-openai-detector',
  LLAMA: 'meta-llama/Llama-3.2-1B-Instruct'
};

export const detectAIContent = async (text) => {
  try {
    if (!hf) {
      return heuristicDetection(text);
    }

    const result = await hf.textClassification({
      model: MODELS.AI_DETECTOR,
      inputs: text
    });

    // Some models return labels as 'Fake'/'Real', others as 'LABEL_0'/'LABEL_1'.
    // Prefer 'Real' score when available; if only generic labels exist, infer with complement.
    const fakeScoreEntry = result.find(r => String(r.label).toLowerCase() === 'fake');
    const realScoreEntry = result.find(r => String(r.label).toLowerCase() === 'real');
    const label0 = result.find(r => String(r.label).toUpperCase() === 'LABEL_0');
    const label1 = result.find(r => String(r.label).toUpperCase() === 'LABEL_1');

    let aiProb;
    let humanProb;

    if (realScoreEntry) {
      // When 'Real' exists, treat its score as human probability, AI is complement
      humanProb = normalizeProbability(realScoreEntry.score || 0);
      aiProb = normalizeProbability(1 - humanProb);
    } else if (fakeScoreEntry) {
      // When only 'Fake' exists, treat its score as AI probability, human is complement
      aiProb = normalizeProbability(fakeScoreEntry.score || 0);
      humanProb = normalizeProbability(1 - aiProb);
    } else if (label0 && label1) {
      // Unknown label mapping: pick the larger as AI if model likely outputs 'LABEL_1' for positive class.
      // Use a conservative approach: consider LABEL_0 as 'Real' when its score is higher.
      const s0 = label0.score || 0;
      const s1 = label1.score || 0;
      if (s0 >= s1) {
        humanProb = normalizeProbability(s0);
        aiProb = normalizeProbability(1 - humanProb);
      } else {
        aiProb = normalizeProbability(s1);
        humanProb = normalizeProbability(1 - aiProb);
      }
    } else {
      // Fallback to heuristic if scores are not usable
      const heuristic = heuristicDetection(text);
      aiProb = heuristic.aiProbability;
      humanProb = heuristic.humanProbability;
    }

    return {
      aiProbability: aiProb,
      humanProbability: humanProb,
      rawScores: result,
      source: 'huggingface'
    };
  } catch (error) {
    console.error('AI Detection Error:', error);
    return heuristicDetection(text);
  }
};

export const generateText = async (promptOrMessages, options = {}) => {
  try {
    if (!hf) {
      return fallbackGenerateText(promptOrMessages);
    }

    const messages = Array.isArray(promptOrMessages)
      ? promptOrMessages
      : [{ role: 'user', content: promptOrMessages }];

    const result = await hf.chatCompletion({
      model: MODELS.LLAMA,
      messages,
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 0.95
    });
    return result.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Text Generation Error:', error);
    return fallbackGenerateText(promptOrMessages);
  }
};

export const classifyText = async (text, labels) => {
  if (!Array.isArray(labels) || labels.length === 0) throw new Error('Labels array required');
  try {
    const prompt = `You are a classifier. Rate relevance (0-1) for each label to the text. Return JSON {"labels":[...],"scores":[...]}. Sort descending by score.
Text: """${text.slice(0,3000)}"""
Labels: ${labels.join(', ')}`;
    const raw = await generateText(prompt, { maxTokens: 400, temperature: 0.2, topP: 0.9 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON returned by model');
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.labels || !parsed.scores || parsed.labels.length !== parsed.scores.length) throw new Error('Malformed JSON');
    const pairs = parsed.labels.map((l,i)=>({label:l,score:parsed.scores[i]})).sort((a,b)=>b.score-a.score);
    return { labels: pairs.map(p=>p.label), scores: pairs.map(p=>p.score), topLabel: pairs[0].label, topScore: pairs[0].score, model: MODELS.LLAMA };
  } catch (error) {
    console.error('Prompt classification error:', error.message);
    const lower = text.toLowerCase();
    const pairs = labels.map(l=>{ const tokens = l.toLowerCase().split(/\s+/); const hits = tokens.reduce((a,t)=>a+(lower.includes(t)?1:0),0); return {label:l,score:hits/tokens.length}; }).sort((a,b)=>b.score-a.score);
    return { labels: pairs.map(p=>p.label), scores: pairs.map(p=>p.score), topLabel: pairs[0].label, topScore: pairs[0].score, model: MODELS.LLAMA, fallback: true };
  }
};

export const analyzeText = async (text) => {
  try {

    const sentimentLabels = ['Very Positive','Positive','Neutral','Negative','Very Negative'];
    const sentiment = await classifyText(text, sentimentLabels);

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
    const avgSentenceLength = wordCount / sentenceCount;

    return {
      sentiment: {
        label: sentiment.topLabel,
        score: Math.round(sentiment.topScore * 100)
      },
      complexity: {
        wordCount,
        sentenceCount,
        avgWordLength: Math.round(avgWordLength * 10) / 10,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        readabilityScore: Math.min(100, Math.max(0, Math.round((100 - avgSentenceLength * 2) + (avgWordLength * 5))))
      }
    };
  } catch (error) {
    console.error('Text Analysis Error:', error);
    throw new Error('Failed to analyze text: ' + error.message);
  }
};

export default hf;
