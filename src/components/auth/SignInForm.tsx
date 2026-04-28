import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
    onSuccess: () => void;
    onSwitch: () => void;
};

export const SignInForm = ({ onSuccess, onSwitch }: Props) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
            toast.error(error);
            return;
        }
        setEmail("");
        setPassword("");
        toast.success("Welcome back!");
        onSuccess();
    };

    return (
        <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sign in</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Welcome back.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to checkout.</p>

            <form onSubmit={submit} className="mt-10 space-y-5">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[11px] uppercase tracking-wider text-muted-foreground">Password</Label>
                    <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-lg" />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full h-11" size="lg">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                New here?{" "}
                <button type="button" onClick={onSwitch} className="font-medium text-foreground hover:underline underline-offset-4">
                    Create account
                </button>
            </p>
        </div>
    );
};