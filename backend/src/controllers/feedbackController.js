/**
 * RailConnect AI - Feedback & Passenger Sentiment Intelligence Controller
 */

import { getFallbackStore } from '../config/db.js';
import { analyzeSentimentAndCategory } from '../../../ml/sentiment_analysis/sentimentEngine.js';

export async function submitFeedback(req, res, next) {
  try {
    const {
      trainId,
      bookingId,
      cleanlinessRating = 5,
      punctualityRating = 5,
      foodRating = 4,
      overallRating = 5,
      comment
    } = req.body;

    const userId = req.user.userId;
    const store = getFallbackStore();

    if (!trainId || !comment) {
      return res.status(400).json({ success: false, message: 'Train ID and feedback comments are required.' });
    }

    // Run ML Sentiment Analysis & Category Classification
    const mlAnalysis = await analyzeSentimentAndCategory(comment);

    const newId = store.feedback.length ? Math.max(...store.feedback.map(f => f.feedback_id)) + 1 : 1;
    const feedbackItem = {
      feedback_id: newId,
      user_id: userId,
      booking_id: bookingId ? Number(bookingId) : null,
      train_id: Number(trainId),
      cleanliness_rating: Number(cleanlinessRating),
      punctuality_rating: Number(punctualityRating),
      food_rating: Number(foodRating),
      overall_rating: Number(overallRating),
      comment,
      sentiment_label: mlAnalysis.sentiment,
      sentiment_score: mlAnalysis.score,
      detected_category: mlAnalysis.category,
      created_at: new Date()
    };

    store.feedback.unshift(feedbackItem);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted and analyzed by ML Sentiment Engine.',
      data: {
        ...feedbackItem,
        sentimentHighlights: mlAnalysis.highlights,
        mlSource: mlAnalysis.source
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllFeedback(req, res, next) {
  try {
    const store = getFallbackStore();
    const list = store.feedback.map(f => {
      const user = store.users.find(u => u.user_id === f.user_id) || {};
      const train = store.trains.find(t => t.train_id === f.train_id) || {};
      return {
        ...f,
        user_name: user.full_name,
        train_name: train.train_name,
        train_number: train.train_number
      };
    });

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrainFeedback(req, res, next) {
  try {
    const trainId = Number(req.params.trainId);
    const store = getFallbackStore();

    const filtered = store.feedback
      .filter(f => f.train_id === trainId)
      .map(f => {
        const user = store.users.find(u => u.user_id === f.user_id) || {};
        return {
          ...f,
          user_name: user.full_name
        };
      });

    // Compute sentiment statistics
    const total = filtered.length || 1;
    const positiveCount = filtered.filter(f => f.sentiment_label === 'POSITIVE').length;
    const neutralCount = filtered.filter(f => f.sentiment_label === 'NEUTRAL').length;
    const negativeCount = filtered.filter(f => f.sentiment_label === 'NEGATIVE').length;

    res.json({
      success: true,
      stats: {
        totalReviews: filtered.length,
        positivePercentage: Math.round((positiveCount / total) * 100),
        neutralPercentage: Math.round((neutralCount / total) * 100),
        negativePercentage: Math.round((negativeCount / total) * 100)
      },
      data: filtered
    });
  } catch (err) {
    next(err);
  }
}
