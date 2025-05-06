"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TasksPage() {
  const { id } = useParams(); // project ID from URL
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
  });
  const [showTaskForm, setShowTaskForm] = useState(false); // State to control form visibility

  // Fetch project tasks and members when the component loads
  useEffect(() => {
    const fetchTasksAndMembers = async () => {
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, description, assigned_to, status, due_date")
        .eq("project_id", id);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError.message);
      } else {
        setTasks(tasksData);
      }

      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select("user_id, profiles(username)")
        .eq("project_id", id);

      if (membersError) {
        console.error("Error fetching members:", membersError.message);
      } else {
        setMembers(membersData);
      }
    };

    if (id) fetchTasksAndMembers();
  }, [id]);

  // Handle task creation
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.assigned_to) {
      alert("Please fill in all required fields.");
      return;
    }

    const { error } = await supabase.from("tasks").insert([
      {
        project_id: id,
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to,
        due_date: newTask.due_date || null,
      },
    ]);

    if (error) {
      alert("Error creating task: " + error.message);
    } else {
      setNewTask({ title: "", description: "", assigned_to: "", due_date: "" });
      // Fetch updated tasks after adding a new one
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, title, description, assigned_to, status, due_date")
        .eq("project_id", id);
      setTasks(tasksData);
      setShowTaskForm(false); // Hide the form after task is added
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Project Tasks</h1>

      {/* Button to toggle task form visibility */}
      <Button onClick={() => setShowTaskForm(!showTaskForm)} className="mb-6">
        {showTaskForm ? "Cancel" : "Add New Task"}
      </Button>

      {/* Show the task form only if showTaskForm is true */}
      {showTaskForm && (
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Task Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Describe the task"
                className="w-full px-4 py-2 border rounded-lg h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Assign to
              </label>
              <select
                value={newTask.assigned_to}
                onChange={(e) =>
                  setNewTask({ ...newTask, assigned_to: e.target.value })
                }
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a member</option>
                {members.map((member: any) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.profiles.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) =>
                  setNewTask({ ...newTask, due_date: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </form>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Task List</h2>
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task: any) => (
            <div
              key={task.id}
              className="border p-6 rounded-lg shadow-md bg-white"
            >
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              <p className="mt-2 text-gray-500">
                Assigned to: {task.assigned_to} | Due:{" "}
                {task.due_date ? task.due_date : "No due date"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Status: {task.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No tasks available for this project.
          </p>
        )}
      </div>
    </div>
  );
}
