"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function MeetingDashboard() {
  const [meetingId, setMeetingId] = useState("");
  const router = useRouter();
  const { id } = useParams<{ id: string }>(); // id = project id

  const createMeeting = () => {
    const newMeetingId = uuidv4();
    router.push(`/projects/${id}/meetings/${newMeetingId}`);
  };

  const joinMeeting = () => {
    if (meetingId.trim()) {
      router.push(`/projects/${id}/meetings/${meetingId}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meetings for Project: {id}</h1>
      <button
        onClick={createMeeting}
        className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
      >
        Create Meeting
      </button>
      <div className="mt-4">
        <input
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          placeholder="Enter Meeting ID"
          className="border p-2 mr-2"
        />
        <button
          onClick={joinMeeting}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}
