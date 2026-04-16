import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const profileSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  bio: z.string().max(150, "Max 150 characters").optional().or(z.literal("")),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const LEVELS = [
  { value: "Beginner" as const, label: "Beginner" },
  { value: "Intermediate" as const, label: "Intermediate" },
  { value: "Advanced" as const, label: "Advanced" },
];

export default function EditProfilePage() {
  const [, navigate] = useLocation();
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      bio: user?.bio ?? "",
      level: (user?.level as ProfileFormData["level"]) ?? "Beginner",
    },
  });

  const bioValue = watch("bio") ?? "";
  const selectedLevel = watch("level");

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const success = await updateProfile({
        name: data.name,
        bio: data.bio || "",
        level: data.level,
      });
      if (success) {
        toast.success("Profile updated!");
        navigate("/me");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.initials || "?";

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={() => navigate("/me")}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">Edit Profile</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg border-4 border-card">
              {initials}
            </div>
            <button
              type="button"
              onClick={() => toast.info("Avatar upload coming soon!")}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              aria-label="Change avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Tap to change photo</p>
        </div>

        {/* Name Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-foreground">
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            {...register("name")}
            className="h-11 rounded-xl bg-muted/50 border-border/60 focus:bg-background"
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register("email")}
            readOnly
            className="h-11 rounded-xl bg-muted/30 border-border/40 text-muted-foreground cursor-not-allowed"
          />
          <p className="text-[11px] text-muted-foreground/60">Email cannot be changed</p>
        </div>

        {/* Bio Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="bio" className="text-sm font-semibold text-foreground">
              Bio
            </label>
            <span
              className={`text-xs font-medium ${
                bioValue.length > 140
                  ? bioValue.length > 150
                    ? "text-red-500"
                    : "text-amber-500"
                  : "text-muted-foreground/60"
              }`}
            >
              {bioValue.length}/150
            </span>
          </div>
          <textarea
            id="bio"
            rows={3}
            placeholder="Tell us about your Pilates journey..."
            {...register("bio")}
            className="flex w-full rounded-xl border border-border/60 bg-muted/50 px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:bg-background resize-none"
          />
          {errors.bio && <p className="text-xs text-red-500 font-medium">{errors.bio.message}</p>}
        </div>

        {/* Level Selector */}
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Pilates level">
          <span className="text-sm font-semibold text-foreground">Level</span>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((level) => {
              const isSelected = selectedLevel === level.value;
              return (
                <Card
                  key={level.value}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/40 bg-muted/30 hover:border-border"
                  }`}
                  onClick={() => setValue("level", level.value, { shouldDirty: true })}
                >
                  <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
                    <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      {level.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <Button type="submit" disabled={saving || !isDirty} className="w-full h-12 rounded-xl text-sm font-bold mt-2">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
