import React, { useState } from 'react';
import Sentiment from 'sentiment';

function SentimentAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const sentiment = new Sentiment();

  const analyzeSentiment = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    const result = sentiment.analyze(text);
    
    // Improved score calculation
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    // Calculate scores based on positive and negative words
    const totalWords = result.words.length;
    const positiveWords = result.positive.length;
    const negativeWords = result.negative.length;
    
    if (totalWords > 0) {
      positive = (positiveWords / totalWords) * 100;
      negative = (negativeWords / totalWords) * 100;
      neutral = 100 - (positive + negative);
    }

    const analysis = {
      sentiment_scores: {
        positive: positive / 100,
        negative: negative / 100,
        neutral: neutral / 100
      },
      overall_sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral'
    };
    
    setAnalysis(analysis);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Sentiment Analysis</h1>
      <div className="max-w-2xl">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
          rows="6"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment..."
        />
        <button
          onClick={analyzeSentiment}
          disabled={loading || !text.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Analyze Sentiment
        </button>

        {analysis && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">Positive</div>
                <div className="text-xl font-bold text-green-600">
                  {(analysis.sentiment_scores.positive * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Neutral</div>
                <div className="text-xl font-bold text-gray-600">
                  {(analysis.sentiment_scores.neutral * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-sm text-gray-600">Negative</div>
                <div className="text-xl font-bold text-red-600">
                  {(analysis.sentiment_scores.negative * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg">
                Overall Sentiment: 
                <span className="font-bold ml-2 capitalize">
                  {analysis.overall_sentiment}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SentimentAnalyzer;