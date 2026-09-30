/**
 * RailConnect AI - Machine Learning Natural Language Processing Module
 * Passenger Feedback & Complaint Sentiment Analyzer
 */

import { GoogleGenAI } from '@google/genai';

const POSITIVE_WORDS = [
  'clean', 'smooth', 'punctual', 'timely', 'fast', 'comfortable', 'excellent',
  'great', 'courteous', 'tasty', 'delicious', 'superb', 'best', 'loved', 'helpful',
  'polite', 'modern', 'hygienic', 'quick', 'efficient', 'pleasant', 'wonderful'
];

const NEGATIVE_WORDS = [
  'delay', 'delayed', 'late', 'dirty', 'filthy', 'unclean', 'stink', 'bad',
  'terrible', 'worst', 'horrible', 'rude', 'cold', 'broken', 'smell', 'mosquito',
  'crowded', 'socket', 'charging', 'disconnect', 'stuck', 'cockroach', 'poor', 'slow'
];

const CATEGORY_MAP = [
  {
    category: 'Delay / Punctuality',
    keywords: ['delay', 'late', 'on time', 'punctual', 'schedule', 'stopped', 'rescheduled', 'hour', 'minute', 'wait']
  },
  {
    category: 'Cleanliness / Hygiene',
    keywords: ['clean', 'dirty', 'washroom', 'toilet', 'bio-toilet', 'smell', 'hygiene', 'filthy', 'stink', 'garbage', 'bin']
  },
  {
    category: 'Food Quality',
    keywords: ['food', 'breakfast', 'dinner', 'lunch', 'tea', 'pantry', 'caterer', 'meal', 'taste', 'cold', 'stale']
  },
  {
    category: 'AC / Electrical',
    keywords: ['ac', 'cooling', 'socket', 'charging', 'light', 'fan', 'temperature', 'plug', 'switch']
  },
  {
    category: 'Comfort / Seating',
    keywords: ['seat', 'berth', 'legroom', 'cushion', 'comfort', 'vibration', 'jerk', 'noise']
  },
  {
    category: 'Staff Behavior',
    keywords: ['staff', 'tt', 'tte', 'crew', 'attendant', 'behavior', 'rude', 'polite', 'helpful', 'security']
  }
];

export async function analyzeSentimentAndCategory(text = '') {
  if (!text || typeof text !== 'string') {
    return {
      sentiment: 'NEUTRAL',
      score: 0.5,
      category: 'General',
      highlights: [],
      source: 'rule_engine'
    };
  }

  const cleanText = text.toLowerCase();

  // Check if Gemini API can be used for deep contextual semantic NLP
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze this railway passenger feedback text:
"${text}"

Return JSON ONLY with this exact format:
{
  "sentiment": "POSITIVE" or "NEGATIVE" or "NEUTRAL",
  "score": number between 0.0 and 1.0 (where 1 is most positive, 0 is most negative),
  "category": "Delay / Punctuality" or "Cleanliness / Hygiene" or "Food Quality" or "AC / Electrical" or "Comfort / Seating" or "Staff Behavior" or "General",
  "highlights": ["key phrases"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          sentiment: parsed.sentiment || 'NEUTRAL',
          score: typeof parsed.score === 'number' ? parsed.score : 0.5,
          category: parsed.category || 'General',
          highlights: parsed.highlights || [],
          source: 'gemini_ml'
        };
      }
    } catch (err) {
      // Fallback seamlessly to local deterministic NLP rule engine
      console.warn('Gemini NLP fallback to local NLP engine:', err.message);
    }
  }

  // Local Fast Deterministic Rule & Heuristic Lexicon Engine
  let posCount = 0;
  let negCount = 0;
  const highlights = [];

  POSITIVE_WORDS.forEach(word => {
    if (cleanText.includes(word)) {
      posCount++;
      highlights.push(word);
    }
  });

  NEGATIVE_WORDS.forEach(word => {
    if (cleanText.includes(word)) {
      negCount++;
      highlights.push(word);
    }
  });

  // Category classification
  const matchedCategories = [];
  CATEGORY_MAP.forEach(cat => {
    const hits = cat.keywords.filter(k => cleanText.includes(k));
    if (hits.length > 0) {
      matchedCategories.push({ name: cat.category, hits: hits.length });
    }
  });

  matchedCategories.sort((a, b) => b.hits - a.hits);
  const detectedCategory = matchedCategories.length > 0 ? matchedCategories[0].name : 'General Passenger Experience';

  let sentiment = 'NEUTRAL';
  let score = 0.5;

  if (negCount > posCount) {
    sentiment = 'NEGATIVE';
    score = Math.max(0.1, 0.45 - (negCount * 0.1));
  } else if (posCount > negCount) {
    sentiment = 'POSITIVE';
    score = Math.min(0.95, 0.55 + (posCount * 0.1));
  } else {
    sentiment = 'NEUTRAL';
    score = 0.50;
  }

  return {
    sentiment,
    score: Number(score.toFixed(3)),
    category: detectedCategory,
    highlights: highlights.slice(0, 4),
    source: 'local_nlp_lexicon'
  };
}
