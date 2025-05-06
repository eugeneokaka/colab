"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    const { email, password, username } = data;

    try {
      if (type === "signup") {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) {
          setError(signUpError.message);
          alert(signUpError.message);
          return;
        }

        const user = signUpData.user;
        if (user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                username,
              },
            ]);

          if (profileError) {
            setError(
              "Signup succeeded but saving profile failed: " +
                profileError.message
            );
            return;
          }
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          return;
        }
      }

      router.push("/"); // redirect after login/signup
    } catch (err: any) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {type === "signup" && (
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <p className="text-sm text-red-500">Username is required</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">Email is required</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">Password is required</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : type === "login" ? "Log In" : "Sign Up"}
      </Button>
    </form>
  );
}
