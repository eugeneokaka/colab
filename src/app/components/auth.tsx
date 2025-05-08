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
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const { email, password, username } = data;

    try {
      if (type === "signup") {
        // Check if username already exists
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .single();

        if (existingUser) {
          setError("Username is already taken.");
          return;
        }

        // Sign up user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }, // optional: store in metadata
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setSuccessMsg(
          "Signup successful! Please check your email to confirm your account."
        );
        return; // do not try to insert profile yet
      } else {
        // Login
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginError) {
          setError(loginError.message);
          return;
        }

        // Insert profile if missing (optional)
        const user = loginData.user;
        if (user) {
          const { data: profile, error: profileFetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!profile) {
            // create profile using metadata.username if exists
            const username =
              loginData.user.user_metadata?.username ||
              "user_" + user.id.slice(0, 6);

            await supabase.from("profiles").insert([
              {
                id: user.id,
                username,
              },
            ]);
          }
        }

        router.push("/"); // redirect to home
      }
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
      {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : type === "login" ? "Log In" : "Sign Up"}
      </Button>
    </form>
  );
}
