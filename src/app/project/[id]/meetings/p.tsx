"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function MeetingPage() {
  const { id } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [joined, setJoined] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);

  useEffect(() => {
    console.log("MeetingPage useEffect run, room id:", id);
    if (!id) return;

    let isMounted = true;

    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "signal",
            roomId: id,
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
        if (!isMounted || peer.signalingState === "closed") {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStreamReady(true);
        console.log("Local stream ready");
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });

    ws.onopen = () => {
      console.log("WebSocket opened, readyState:", ws.readyState);
      ws.send(JSON.stringify({ type: "join", roomId: id }));
      setJoined(true);
      console.log("WebSocket connected and joined room", id);
    };

    ws.onmessage = async (message) => {
      const { type, payload } = JSON.parse(message.data);
      console.log("Received WS message:", type, payload);
      if (type === "signal") {
        if (payload.type === "offer") {
          await peer.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          ws.send(
            JSON.stringify({ type: "signal", roomId: id, payload: answer })
          );
        } else if (payload.type === "answer") {
          await peer.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (payload.candidate) {
          await peer.addIceCandidate(new RTCIceCandidate(payload));
        }
      }
    };

    return () => {
      isMounted = false;
      ws.close();
      peer.close();
      console.log("Cleanup done: WebSocket and peer closed");
    };
  }, [id]);

  console.log("Render:", { joined, localStreamReady });

  const startCall = async () => {
    if (!peerRef.current || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not open yet");
      return;
    }
    console.log("Starting call...");
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    wsRef.current.send(
      JSON.stringify({ type: "signal", roomId: id, payload: offer })
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Meeting Room: {id}</h2>
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
      {joined && localStreamReady && (
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
