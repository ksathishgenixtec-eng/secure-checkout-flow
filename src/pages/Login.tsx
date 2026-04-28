import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

const Login = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next");
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Redirect already-logged-in users away from /login
  useEffect(() => {
    if (user) navigate(next || "/", { replace: true });
  }, [user, next, navigate]);

  // Sign in: go to `next` if provided, else products
  const handleSignInSuccess = () => {
    navigate(next || "/", { replace: true });
  };

  // Sign up: if came from cart → cart, else products
  const handleSignUpSuccess = () => {
    if (next && next.startsWith("/cart")) {
      navigate(next, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container flex items-center justify-center py-20 md:py-28">
        <div className="w-full max-w-sm">
          {mode === "signin" ? (
            <SignInForm onSuccess={handleSignInSuccess} onSwitch={() => setMode("signup")} />
          ) : (
            <SignUpForm onSuccess={handleSignUpSuccess} onSwitch={() => setMode("signin")} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;