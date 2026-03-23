import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type SignupForm = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    const success = await login(data.email, data.password);
    setLoading(false);
    if (success) {
      toast.success("Welcome back!");
    } else {
      toast.error("Invalid email or password");
    }
  };

  const onSignup = async (data: SignupForm) => {
    setLoading(true);
    const success = await signup(data.name, data.email, data.password);
    setLoading(false);
    if (success) {
      toast.success("Account created! Welcome to PilatesHub.");
    } else {
      toast.error("Could not create account. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(170deg, hsl(38 42% 97%) 0%, hsl(33 30% 93%) 40%, hsl(28 25% 90%) 100%)" }}
    >
      {/* Subtle decorative circles */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, hsl(28 22% 38%) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, hsl(16 50% 58%) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground mx-auto mb-5 shadow-lg glow-warm">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="font-studio text-3xl text-foreground" style={{ fontWeight: 600, letterSpacing: "-0.03em" }}>
            PilatesHub
          </h1>
          <p className="text-sm text-muted-foreground mt-2 tracking-wide">Move well. Live well.</p>
        </div>

        <div className="bg-card rounded-3xl shadow-xl p-7 border border-border/40">
          <Tabs defaultValue="login">
            <TabsList className="w-full grid grid-cols-2 bg-muted p-1 rounded-xl h-10 mb-6">
              <TabsTrigger
                value="login"
                className="rounded-lg font-semibold text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg font-semibold text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="flex flex-col gap-3.5">
                <div>
                  <Input
                    {...loginForm.register("email")}
                    type="email"
                    placeholder="Email"
                    className="bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...loginForm.register("password")}
                    type="password"
                    placeholder="Password"
                    className="bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={loginForm.handleSubmit(onLogin)}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 h-11 btn-premium shadow-md"
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="flex flex-col gap-3.5">
                <div>
                  <Input
                    {...signupForm.register("name")}
                    placeholder="Full Name"
                    className="bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...signupForm.register("email")}
                    type="email"
                    placeholder="Email"
                    className="bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...signupForm.register("password")}
                    type="password"
                    placeholder="Password"
                    className="bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...signupForm.register("confirmPassword")}
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={signupForm.handleSubmit(onSignup)}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 h-11 btn-premium shadow-md"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6 tracking-wide">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
