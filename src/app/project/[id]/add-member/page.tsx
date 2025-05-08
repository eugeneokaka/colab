"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase"; // Adjust the import path as necessary

const AddMemberForm = () => {
  const { id } = useParams(); // project ID from URL
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Find user by username
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username)
        .single();

      if (userError || !user) {
        setError("User not found.");
        return;
      }

      // Insert the user into the project_members table
      const { error: insertError } = await supabase
        .from("project_members")
        .insert([
          {
            project_id: id,
            user_id: user.id,
          },
        ]);

      if (insertError) {
        setError("Failed to add user: " + insertError.message);
      } else {
        alert("User added successfully!");
        router.push(`/project/${id}`); // Redirect back to the project page
      }
    } catch (err: any) {
      setError("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Member</h1>

      <form onSubmit={handleAddMember} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            User's Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
      </form>
    </div>
  );
};

export default AddMemberForm;
