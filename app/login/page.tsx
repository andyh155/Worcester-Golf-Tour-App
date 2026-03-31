"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}