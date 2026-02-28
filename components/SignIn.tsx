import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignIn({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnonymous = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn("anonymous");
      onSuccess?.();
    } catch (e) {
      setError("Failed to sign in anonymously");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, flow: mode });
      onSuccess?.();
    } catch (err) {
      setError(
        mode === "signUp"
          ? "Failed to sign up. The email may already be in use."
          : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-6 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome to Sporcle</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to start or join games
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleAnonymous}
        disabled={loading}
      >
        Continue as Guest
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <form onSubmit={handlePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {mode === "signIn" ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signIn" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              className="underline hover:text-foreground"
              onClick={() => { setMode("signUp"); setError(""); }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              className="underline hover:text-foreground"
              onClick={() => { setMode("signIn"); setError(""); }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
