export default function TheaterSkeleton() {
  return (
    <div className="theater-card glass-card skeleton-theater">
      <div className="skeleton-header">
        <div className="skeleton title-skeleton"></div>
        <div className="skeleton subtitle-skeleton"></div>
      </div>
      <div className="skeleton-times">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton time-btn-skeleton"></div>
        ))}
      </div>
      <style jsx>{`
        .skeleton-theater {
          padding: 2rem;
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }
        .skeleton-header { margin-bottom: 2rem; }
        .title-skeleton { width: 40%; height: 24px; margin-bottom: 10px; }
        .subtitle-skeleton { width: 20%; height: 14px; }
        .skeleton-times { display: flex; gap: 1rem; }
        .time-btn-skeleton { width: 100px; height: 50px; border-radius: 12px; }
      `}</style>
    </div>
  );
}
