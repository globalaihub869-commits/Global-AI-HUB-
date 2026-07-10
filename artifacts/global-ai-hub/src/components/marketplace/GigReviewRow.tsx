import { BadgeCheck } from "lucide-react";
import StarRating from "@/components/marketplace/StarRating";

interface GigReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function GigReviewRow({ review }: { review: GigReview }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-3 rounded-lg border border-white/5 bg-white/[0.02]"
      data-testid={`gig-review-${review.id}`}
      itemProp="review"
      itemScope
      itemType="https://schema.org/Review"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white" itemProp="author">{review.author}</span>
          <StarRating rating={review.rating} />
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400/80 bg-emerald-400/5 border border-emerald-400/20 rounded-full px-2 py-0.5"
          title="Structured data (schema.org/Review) attached for Google rich results"
          data-testid={`seo-schema-tag-${review.id}`}
        >
          <BadgeCheck className="w-3 h-3" /> Google SEO Schema
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed" itemProp="reviewBody">{review.comment}</p>
      <meta itemProp="datePublished" content={review.createdAt} />
      <meta itemProp="ratingValue" content={String(review.rating)} />
    </div>
  );
}
