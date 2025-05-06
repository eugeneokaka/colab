import React from "react";
import { Button } from "@/components/ui/button";
function Loggedout() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Welcome to Colab</h1>
        <p className="text-lg mb-8">
          Your collaborative platform for everything.
        </p>
        <Button variant={"default"}>get started</Button>
      </div>
    </div>
  );
}

export default Loggedout;
