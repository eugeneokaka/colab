// lib/streamToken.ts
// import jwt from "jsonwebtoken";

// export function generateStreamToken(userId: string): string {
//   const secret = process.env.STREAM_SECRET!;
//   const payload = {
//     user_id: userId,
//   };

//   return jwt.sign(payload, secret, {
//     algorithm: "HS256",
//     expiresIn: "1h",
//   });
// }
import { StreamVideoClient } from "@stream-io/video-react-sdk";

export const getStreamClient = (
  apiKey: string,
  userId: string,
  userToken: string
) => {
  const client = new StreamVideoClient({
    apiKey,
    user: { id: userId },
    token: userToken,
  });
  return client;
};
