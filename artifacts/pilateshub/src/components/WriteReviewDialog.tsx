import { useState } from "react";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { StudioReview } from "@/data/types";

const reviewSchema = z.object({
  text: z.string().min(10, "Write at least 10 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface WriteReviewDialogProps {
  studioName: string;
  studioId: number;
  onReviewAdded?: (review: StudioReview) => void;
  children: React.ReactNode;
}

export function WriteReviewDialog({
  studioName,
  studioId,
  onReviewAdded,
  children,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const newReview: StudioReview = {
      id: Date.now(),
      studioId,
      userId: 1,
      userName: "You",
      userInitials: "YO",
      userColor: "bg-primary/20",
      rating,
      text: data.text,
      date: "Just now",
      helpful: 0,
    };

    onReviewAdded?.(newReview);

    toast.success(`Review posted for ${studioName}!`);
    reset();
    setRating(0);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[360px] rounded-2xl border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Review {studioName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Interactive star rating */}
          <div className="flex flex-col items-center gap-1 py-2">
            <p className="text-xs text-muted-foreground mb-1">
              {rating === 0
                ? "Tap to rate"
                : rating === 1
                  ? "Poor"
                  : rating === 2
                    ? "Fair"
                    : rating === 3
                      ? "Good"
                      : rating === 4
                        ? "Very Good"
                        : "Excellent"}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoveredRating(i)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(i)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      i <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review text area */}
          <div>
            <textarea
              {...register("text")}
              placeholder="Share your experience..."
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            />
            {errors.text && (
              <p className="text-xs text-destructive mt-1">
                {errors.text.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/85 text-white font-bold shadow-sm"
          >
            Post Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
