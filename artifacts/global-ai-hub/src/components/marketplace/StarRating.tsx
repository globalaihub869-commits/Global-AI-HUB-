import { Star } from "lucide-react";

export default function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <span className="inline-flex items-center gap-0.5" data-testid="star-rating" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return <Star key={i} className={`${dim} ${filled ? "text-yellow-400 fill-yellow-400" : "text-white/15"}`} />;
      })}
    </span>
  );
}
