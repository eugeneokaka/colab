"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) return alert("Error fetching user: " + error.message);
    if (!user) return alert("You must be logged in to create a project.");

    // 1. Create project
    const { data: projectData, error: insertError } = await supabase
      .from("projects")
      .insert([
        {
          name,
          description,
          status,
          created_by: user.id,
        },
      ])
      .select()
      .single(); // gets the newly inserted row

    if (insertError || !projectData) {
      alert(insertError?.message || "Failed to create project");
      return;
    }

    // 2. Add current user as a member (admin)
    const { error: memberError } = await supabase
      .from("project_members")
      .insert([
        {
          project_id: projectData.id,
          user_id: user.id,
          role: "admin", // set role to admin by default
        },
      ]);

    if (memberError) {
      alert(
        "Project created but failed to add you as a member: " +
          memberError.message
      );
    } else {
      alert("Project created and you were added as admin!");
    }

    // Optionally reset form
    setName("");
    setDescription("");
    setStatus("pending");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Create New Project
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project"
            required
            className="w-full px-4 py-2 border rounded-lg h-28 resize-none focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-black transition-colors"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
