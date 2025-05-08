"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabase";

interface Profile {
  username: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

interface SupabaseMessage extends Omit<Message, "profiles"> {
  profiles: Profile[];
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      } else {
        console.error("User not logged in or session expired", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, user_id, content, created_at, profiles(username)")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error.message);
      } else {
        const transformedMessages = (data as SupabaseMessage[]).map((msg) => ({
          ...msg,
          profiles: msg.profiles[0]
            ? { username: msg.profiles[0].username }
            : undefined,
        }));
        setMessages(transformedMessages ?? []);
      }
    };

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Fetch associated profile username
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", newMessage.user_id)
            .single();

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              ...newMessage,
              profiles: { username: profile?.username ?? "Unknown User" },
            },
          ]);
        }
      )
      .subscribe();

    fetchMessages();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("You must be logged in to send messages.");
      return;
    }

    if (newMessage.trim() === "") {
      alert("Message cannot be empty!");
      return;
    }

    const { error } = await supabase.from("messages").insert([
      {
        user_id: userId,
        content: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error.message);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Real-Time Chat</h1>

      <div className="mb-8">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            className="w-full px-4 py-2 border rounded-lg resize-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className="border p-4 rounded-lg shadow-md bg-white"
              >
                <p>{message.content}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Posted by {message.profiles?.username ?? "Unknown User"} at{" "}
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No messages yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
