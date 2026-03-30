import React, { useState, useEffect, useRef } from 'react';
import { Star, X, Send, Sparkles, ThumbsUp, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

/* ─── Quick-tag suggestions for each star tier ─── */
const QUICK_TAGS = {
  1: ['Late delivery', 'Cold food', 'Wrong order', 'Bad packaging'],
  2: ['Took too long', 'Average taste', 'Missing items', 'Not fresh'],
  3: ['Decent food', 'Okay packaging', 'Could be better', 'Fair price'],
  4: ['Tasty food', 'Good packaging', 'Quick delivery', 'Would order again'],
  5: ['Amazing taste', 'Super fast', 'Perfect order', 'Best ever!'],
};

const STAR_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Loved it!'];
const STAR_EMOJIS = ['', '😞', '😐', '🙂', '😊', '🤩'];

const RatingModal = ({ order, onClose, onRated }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  /* close on Escape */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const buildReview = () => {
    const parts = [];
    if (selectedTags.length) parts.push(selectedTags.join(', '));
    if (review.trim()) parts.push(review.trim());
    return parts.join('. ') || undefined;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderId = order.id || order._id;
      const payload = {
        rating,
        review: buildReview(),
        ratedAt: new Date().toISOString(),
      };

      const response = await api.orders.addRating(orderId, payload);

      if (response.data?.success) {
        setSubmitted(true);
        setTimeout(() => {
          onRated?.(orderId, rating, buildReview());
          onClose();
        }, 1800);
      } else {
        setError(response.data?.message || 'Rating submission failed');
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeStar = hoveredStar || rating;
  const tags = QUICK_TAGS[activeStar] || [];

  /* ─── Success state ─── */
  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          className="bg-white rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl"
          style={{ animation: 'ratingPop .4s cubic-bezier(.34,1.56,.64,1)' }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-500 text-sm">
            Your {STAR_LABELS[rating]?.toLowerCase()} rating for{' '}
            <span className="font-semibold text-gray-700">{order.restaurantName}</span> has been
            submitted.
          </p>
          <div className="flex justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-6 h-6 transition-all ${
                  s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main modal ─── */
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'ratingSlide .35s cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* Gradient header */}
        <div
          className="relative px-6 pt-7 pb-5"
          style={{
            background: 'linear-gradient(135deg, #FF5200 0%, #FF8C00 50%, #FFB347 100%)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-1.5">
            <Sparkles className="w-5 h-5 text-white/90" />
            <h2 className="text-lg font-bold text-white tracking-tight">Rate Your Order</h2>
          </div>
          <p className="text-white/80 text-sm">{order.restaurantName}</p>
          <p className="text-white/60 text-xs mt-0.5">
            #{order.orderId?.slice(-8)} · {order.items?.length || 0} item
            {(order.items?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Stars */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="group focus:outline-none"
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => { setRating(s); setSelectedTags([]); }}
                  aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
                  data-testid={`star-${s}`}
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-200 cursor-pointer ${
                      s <= activeStar
                        ? 'fill-amber-400 text-amber-400 scale-110'
                        : 'text-gray-200 group-hover:text-amber-200'
                    }`}
                    style={{
                      filter: s <= activeStar ? 'drop-shadow(0 2px 4px rgba(251,191,36,.4))' : 'none',
                      transitionDelay: `${s * 30}ms`,
                    }}
                  />
                </button>
              ))}
            </div>

            {activeStar > 0 && (
              <div className="flex items-center justify-center gap-1.5" style={{ animation: 'ratingFadeIn .25s ease' }}>
                <span className="text-xl">{STAR_EMOJIS[activeStar]}</span>
                <span className="text-sm font-semibold text-gray-700">{STAR_LABELS[activeStar]}</span>
              </div>
            )}
            {activeStar === 0 && (
              <p className="text-sm text-gray-400">Tap a star to rate</p>
            )}
          </div>

          {/* Quick tags */}
          {rating > 0 && tags.length > 0 && (
            <div style={{ animation: 'ratingFadeIn .3s ease' }}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Quick feedback</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                        active
                          ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {active && <ThumbsUp className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review textarea */}
          {rating > 0 && (
            <div style={{ animation: 'ratingFadeIn .35s ease' }}>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                Write a review (optional)
              </label>
              <textarea
                ref={textareaRef}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                maxLength={500}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all resize-none"
                data-testid="review-textarea"
              />
              <p className="text-right text-xs text-gray-300 mt-1">{review.length}/500</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              rating > 0
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200/50 active:scale-[.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            data-testid="submit-rating-btn"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Rating
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes ratingSlide {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes ratingPop {
          from { transform: scale(.7); opacity: 0; }
          to   { transform: scale(1);  opacity: 1; }
        }
        @keyframes ratingFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RatingModal;
