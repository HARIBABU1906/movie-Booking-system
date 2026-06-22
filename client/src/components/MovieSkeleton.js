export default function MovieSkeleton() {
  return (
    <div className="movie-card skeleton-card">
      <div className="skeleton poster-skeleton"></div>
      <div className="skeleton-content">
        <div className="skeleton title-skeleton"></div>
        <div className="skeleton meta-skeleton"></div>
      </div>
      <style jsx>{`
        .skeleton-card {
          width: 100%;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .poster-skeleton {
          width: 100%;
          padding-top: 150%;
          background: rgba(255, 255, 255, 0.05);
        }
        .skeleton-content {
          padding: 1rem 0.8rem;
          height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .title-skeleton {
          width: 80%;
          height: 18px;
          margin-bottom: 8px;
        }
        .meta-skeleton {
          width: 50%;
          height: 12px;
        }
      `}</style>
    </div>
  );
}
