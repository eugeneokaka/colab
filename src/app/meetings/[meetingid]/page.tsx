"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function MeetingPage() {
  const { projectId } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const ws = new WebSocket("ws://localhost:3001"); // or your deployed signaling server
    wsRef.current = ws;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(
          JSON.stringify({
            type: "signal",
            roomId: projectId,
            payload: event.candidate,
          })
        );
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", roomId: projectId }));
      setJoined(true);
    };

    ws.onmessage = async (message) => {
      const { type, payload } = JSON.parse(message.data);
      if (type === "signal") {
        if (payload.type === "offer") {
          await peer.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          ws.send(
            JSON.stringify({
              type: "signal",
              roomId: projectId,
              payload: answer,
            })
          );
        } else if (payload.type === "answer") {
          await peer.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (payload.candidate) {
          await peer.addIceCandidate(new RTCIceCandidate(payload));
        }
      }
    };

    // Cleanup on unmount
    return () => {
      ws.close();
      peer.close();
    };
  }, [projectId]);

  const startCall = async () => {
    if (!peerRef.current || !wsRef.current) return;

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    wsRef.current.send(
      JSON.stringify({ type: "signal", roomId: projectId, payload: offer })
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Meeting Room: {projectId}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Your Video</h4>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg shadow"
          />
        </div>
        <div>
          <h4 className="font-semibold">Remote Video</h4>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg shadow"
          />
        </div>
      </div>
      {joined && (
        <button
          onClick={startCall}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start Call
        </button>
      )}
    </div>
  );
}
