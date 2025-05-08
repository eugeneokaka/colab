"use client";

import { useState } from "react";
import { supabase } from "../../../../../../lib/supabase";
import { Button } from "@/components/ui/button";

interface AddTaskFormProps {
  projectId: string;
  members: { user_id: string; profiles: { username: string } }[];
  onTaskAdded: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  projectId,
  members,
  onTaskAdded,
}) => {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!newTask.title || !newTask.assigned_to) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("tasks").insert([
      {
        project_id: projectId,
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
      onTaskAdded(); // Notify parent component to refresh task list
    }

    setLoading(false);
  };

  return (
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
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
            {members.map((member) => (
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
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
};

export default AddTaskForm;
