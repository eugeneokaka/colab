"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Nav() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user and their profile
  const getUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        setUserName(null);
      } else {
        setUserName(profile?.username || "User");
      }
    } else {
      setUserName(null);
    }

    setLoading(false);
  };

  // Run on mount
  useEffect(() => {
    getUserData();

    // Listen for auth state changes (e.g. login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUserData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserName(null);
    router.push("/"); // Optional: redirect on logout
  };

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        <h1 className="font-sans text-xl cursor-pointer">Colab</h1>
      </Link>
      <div>
        {loading ? (
          <p>loading</p>
        ) : userName ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Hi, {userName}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/login" className="mr-2">
              <Button variant="outline" className="mr-2">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="default" className="mr-2">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Nav;
