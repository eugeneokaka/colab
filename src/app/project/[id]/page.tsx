"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

export default function ProjectPage() {
  const { id } = useParams(); // project ID from URL
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading project:", error.message);
      } else {
        setProject(data);
      }
    };

    if (id) fetchProject();
  }, [id]);

  if (!project) {
    return (
      <p className="text-center mt-10 text-gray-600">Loading project...</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{project.name}</h1>
      <p className="text-gray-700 mb-10 text-center">{project.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { title: "Tasks", href: `/project/${id}/tasks` },
          { title: "Meetings", href: `/project/${id}/meetings` },
          { title: "Files", href: `/project/${id}/files` },
          { title: "Charts", href: `/project/${id}/charts` },
        ].map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="border p-6 rounded-2xl shadow-md hover:shadow-xl transition-all bg-white cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
              <p className="text-gray-500">
                View and manage {card.title.toLowerCase()} for this project.
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
