"use client";
import { Button } from "@/components/ui/button";
import Loggedin from "./components/loggedin";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Loggedout from "./components/loggedout";
export default function Home() {
  const [show, setshow] = useState<Boolean>(false);
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setshow(true);
      } else {
        setshow(false);
      }
    };

    getUserData();
  }, []);

  return <div className="">{show ? <Loggedin /> : <Loggedout />}</div>;
}
