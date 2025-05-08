"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Types
interface TaskData {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: string;
  due_date: string | null;
}

interface Member {
  user_id: string;
  profiles: {
    username: string;
  };
}

export default function TasksPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Partial<TaskData>>({});
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    const fetchTasksAndMembers = async () => {
      const [
        { data: tasksData, error: tasksError },
        { data: membersData, error: membersError },
      ] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, description, assigned_to, status, due_date")
          .eq("project_id", id),
        supabase
          .from("project_members")
          .select("user_id, profiles(username)")
          .eq("project_id", id),
      ]);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError.message);
      } else {
        setTasks(tasksData as TaskData[]);
      }

      if (membersError) {
        console.error("Error fetching members:", membersError.message);
      } else {
        const typedMembers = (membersData || []).map((m: any) => ({
          user_id: m.user_id,
          profiles: { username: m.profiles.username },
        }));
        setMembers(typedMembers);
      }
    };

    if (id) fetchTasksAndMembers();
  }, [id]);

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
        status: "in-progress",
      },
    ]);

    if (error) {
      alert("Error creating task: " + error.message);
    } else {
      setNewTask({ title: "", description: "", assigned_to: "", due_date: "" });
      refreshTasks();
      setShowTaskForm(false);
    }
  };

  const refreshTasks = async () => {
    const { data: updatedTasks } = await supabase
      .from("tasks")
      .select("id, title, description, assigned_to, status, due_date")
      .eq("project_id", id);
    setTasks(updatedTasks as TaskData[]);
  };

  const handleEditTask = (task: TaskData) => {
    setEditingTaskId(task.id);
    setEditTask({
      title: task.title,
      description: task.description,
      status: task.status,
    });
  };

  const handleSaveEdit = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
      })
      .eq("id", taskId);

    if (error) {
      alert("Error updating task: " + error.message);
    } else {
      setEditingTaskId(null);
      setEditTask({});
      refreshTasks();
    }
  };

  const getUsername = (userId: string) =>
    members.find((m) => m.user_id === userId)?.profiles.username || userId;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Project Tasks</h1>

      <Button onClick={() => setShowTaskForm(!showTaskForm)} className="mb-6">
        {showTaskForm ? "Cancel" : "Add New Task"}
      </Button>

      {showTaskForm && (
        <form onSubmit={handleAddTask} className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Add New Task</h2>

          <div>
            <label className="block mb-1 font-medium">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg h-28 resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Assign to</label>
            <select
              value={newTask.assigned_to}
              onChange={(e) =>
                setNewTask({ ...newTask, assigned_to: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg"
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
            <label className="block mb-1 font-medium">Due Date</label>
            <input
              type="date"
              value={newTask.due_date}
              onChange={(e) =>
                setNewTask({ ...newTask, due_date: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      )}

      <h2 className="text-xl font-semibold mb-4">Task List</h2>
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="border p-6 rounded-lg shadow-md bg-white"
            >
              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editTask.title || ""}
                    onChange={(e) =>
                      setEditTask({ ...editTask, title: e.target.value })
                    }
                    className="w-full mb-2 px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    value={editTask.description || ""}
                    onChange={(e) =>
                      setEditTask({
                        ...editTask,
                        description: e.target.value,
                      })
                    }
                    className="w-full mb-2 px-3 py-2 border rounded-lg resize-none"
                  />
                  <select
                    value={editTask.status || "in-progress"}
                    onChange={(e) =>
                      setEditTask({ ...editTask, status: e.target.value })
                    }
                    className="w-full mb-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                  <Button onClick={() => handleSaveEdit(task.id)}>Save</Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-gray-600">{task.description}</p>
                  <p className="mt-2 text-gray-500">
                    Assigned to: {getUsername(task.assigned_to)} | Due:{" "}
                    {task.due_date || "No due date"}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Status: {task.status}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => handleEditTask(task)}
                  >
                    Edit
                  </Button>
                </>
              )}
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
