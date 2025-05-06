"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

function Loggedin() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user", userError);
        return;
      }

      // 1. Get the project_ids the user is a member of
      const { data: memberRows, error: memberError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      if (memberError) {
        console.error("Error fetching memberships", memberError);
        return;
      }

      const projectIds = memberRows.map((row) => row.project_id);
      if (projectIds.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // 2. Fetch project details using the project IDs
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("created_at", { ascending: false });

      if (projectError) {
        console.error("Error fetching projects", projectError);
      } else {
        setProjects(projectData || []);
      }

      setLoading(false);
    };

    fetchProjects();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-center text-2xl font-bold mb-4">My Projects</h1>

      <div className="flex justify-center mb-6">
        <Link href="/new-project">
          <Button variant="default">Create New Project</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-500">
          You're not part of any projects.
        </p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project.id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-gray-700">{project.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Status: <span className="capitalize">{project.status}</span>
              </p>
              <Link href={`/project/${project.id}`}>
                <Button className="my-2">read more</Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Loggedin;
