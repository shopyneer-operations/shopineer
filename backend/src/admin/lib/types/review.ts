export interface Review {
  id: string;
  rating: number;
  title: string;
  description?: string;
  approved_at?: Date;
}
