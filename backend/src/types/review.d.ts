export interface Review {
  id: string;
  rating: number;
  title: string;
  description?: string;
  approved_at?: Date;
}

export interface ReviewDto {
  product_id: string;
  customer_id: string;
  rating: number;
  title: string;
  description?: string;
}

export interface ApproveReviewDto {
  review_id: string;
  user_id: string;
}

export interface ResponseDto {
  user_id: string;
  review_id: string;
  text: string;
}
