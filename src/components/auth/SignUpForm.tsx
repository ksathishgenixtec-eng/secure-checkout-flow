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

export const SignUpForm = ({ onSuccess, onSwitch }: Props) => {
    const { signUp } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) {
            toast.error("First name and last name are required");
            return;
        }
        setLoading(true);
        const { error } = await signUp(email, password, firstName.trim(), lastName.trim());
        setLoading(false);
        if (error) {
            toast.error(error);
            return;
        }
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        toast.success("Account created. You're signed in.");
        onSuccess();
    };

    return (
        <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sign up</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Create your account.</h1>
            <p className="mt-2 text-sm text-muted-foreground">A few details to get you started.</p>

            <form onSubmit={submit} className="mt-10 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-[11px] uppercase tracking-wider text-muted-foreground">First name</Label>
                        <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="h-11 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-[11px] uppercase tracking-wider text-muted-foreground">Last name</Label>
                        <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="h-11 rounded-lg" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[11px] uppercase tracking-wider text-muted-foreground">Password</Label>
                    <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-lg" />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full h-11" size="lg">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={onSwitch} className="font-medium text-foreground hover:underline underline-offset-4">
                    Sign in
                </button>
            </p>
        </div>
    );
};