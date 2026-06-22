import React, { useState } from 'react';
import { addMovieReview } from '../api/movieApi';

export default function ReviewSection({ movie, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resp = await addMovieReview(movie.id || movie._id, { rating, comment });
      onReviewAdded(resp.reviews, resp.rating);
      setComment('');
      setRating(5);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-container stagger-item">
      <h3 className="premium-font section-title">Audience Reviews</h3>
      
      <div className="reviews-grid">
        <div className="reviews-list">
          {movie.reviews && movie.reviews.length > 0 ? (
            movie.reviews.map((rev) => (
              <div key={rev._id} className="review-card glass-card">
                <div className="review-header">
                  <span className="reviewer-name">{rev.name || 'User'}</span>
                  <span className="review-rating">★ {rev.rating}/5</span>
                </div>
                <p className="review-comment">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-muted">No reviews yet. Be the first to review!</p>
          )}
        </div>

        <div className="add-review-section">
          <form className="glass-card review-form" onSubmit={handleSubmit}>
            <h4 className="premium-font">Rate this Movie</h4>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`star-btn ${rating >= num ? 'active' : ''}`}
                  onClick={() => setRating(num)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .review-container { margin-top: 4rem; }
        .reviews-grid { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; margin-top: 2rem; }
        
        .reviews-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .review-card { padding: 1.5rem; border-left: 3px solid var(--accent-green); }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 0.8rem; }
        .reviewer-name { font-weight: 700; color: var(--white); }
        .review-rating { color: var(--accent-gold); font-weight: 800; font-size: 0.9rem; }
        .review-comment { color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; }

        .add-review-section { position: sticky; top: 100px; height: fit-content; }
        .review-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .review-form h4 { margin-bottom: 0.5rem; color: var(--white); }
        
        .rating-selector { display: flex; gap: 8px; font-size: 1.5rem; }
        .star-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .star-btn.active { color: var(--accent-gold); }
        .star-btn:hover { transform: scale(1.2); }

        textarea {
          width: 100%; min-height: 120px; background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border); border-radius: 12px;
          padding: 1rem; color: var(--white); font-family: inherit; resize: vertical;
        }
        textarea:focus { outline: none; border-color: var(--accent-cyan); }
        
        @media (max-width: 900px) {
          .reviews-grid { grid-template-columns: 1fr; }
          .add-review-section { position: static; }
        }
      `}</style>
    </div>
  );
}
