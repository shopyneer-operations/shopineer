import { Star, StarSolid } from "@medusajs/icons";

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array(rating)
        .fill(null)
        .map((_, i) => (
          <StarSolid key={i} className="text-yellow-600" />
        ))}
      {Array(5 - rating)
        .fill(null)
        .map((_, i) => (
          <Star key={i} className="text-yellow-600" />
        ))}
    </div>
  );
}
