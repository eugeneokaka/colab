"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function MeetingRoom() {
  const { messageId } = useParams<{ messageId: string }>();
  const meetingId = messageId; // Now using messageId from URL

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<any>(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    const setupMedia = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      localStream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream);
      });

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit("ice-candidate", {
            room: meetingId,
            candidate: event.candidate,
          });
        }
      };

      socket.current.emit("join-room", meetingId);

      socket.current.on("user-joined", async () => {
        const offer = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offer);
        socket.current.emit("offer", { room: meetingId, offer });
      });

      socket.current.on("offer", async (offer: RTCSessionDescriptionInit) => {
        await peerConnection.current!.setRemoteDescription(offer);
        const answer = await peerConnection.current!.createAnswer();
        await peerConnection.current!.setLocalDescription(answer);
        socket.current.emit("answer", { room: meetingId, answer });
      });

      socket.current.on("answer", async (answer: RTCSessionDescriptionInit) => {
        await peerConnection.current!.setRemoteDescription(answer);
      });

      socket.current.on(
        "ice-candidate",
        async (candidate: RTCIceCandidateInit) => {
          try {
            await peerConnection.current!.addIceCandidate(candidate);
          } catch (err) {
            console.error("Error adding ICE candidate", err);
          }
        }
      );
    };

    setupMedia();

    return () => {
      socket.current.disconnect();
    };
  }, [meetingId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Meeting ID: {meetingId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full border rounded"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full border rounded"
        />
      </div>
    </div>
  );
}
