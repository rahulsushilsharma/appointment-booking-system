import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/conts";
import { useState } from "react";

export function AuthScreen({
  setToken,
  setUserDetails,
}: {
  setToken: (token: string) => void;
  setUserDetails: (userDetails: { name: string; email: string }) => void;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const update = (e: { target: { name: string; value: unknown } }) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const url = isLogin ? "/auth/login" : "/auth/register";

    const res = await fetch(API_URL + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      const e = await res.json();
      const message = e.detail?.[0]?.msg || "Something went wrong";
      alert(message);

      return;
    }

    if (isLogin) {
      setToken(data.access_token);
      setUserDetails(data.user);
    } else setIsLogin(true);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-semibold text-center">
        {isLogin ? "Login" : "Register"}
      </h1>

      {!isLogin && <Input name="name" placeholder="Name" onChange={update} />}

      <Input name="email" placeholder="Email" onChange={update} />
      <Input
        name="password"
        placeholder="Password"
        type="password"
        onChange={update}
      />

      <Button className="w-full" onClick={submit}>
        {isLogin ? "Login" : "Register"}
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Create an account" : "Back to login"}
      </Button>
    </div>
  );
}
