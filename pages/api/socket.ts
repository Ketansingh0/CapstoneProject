import { NextApiRequest, NextApiResponse } from "next"
import { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { getNotificationService } from "@/lib/notifications"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log("Socket is already running")
    res.end()
    return
  }

  console.log("Socket is initializing")
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  // Initialize notification service
  getNotificationService(io)

  res.socket.server.io = io
  res.end()
}

export default SocketHandler
