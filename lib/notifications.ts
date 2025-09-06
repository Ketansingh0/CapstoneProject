import { Server as SocketIOServer } from "socket.io"
import { Server as NetServer } from "http"
import { NextApiResponse } from "next"
import { Socket } from "socket.io"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export interface NotificationData {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  userId: string
  createdAt: Date
  read: boolean
}

export class NotificationService {
  private io: SocketIOServer
  private userSockets: Map<string, string> = new Map() // userId -> socketId

  constructor(io: SocketIOServer) {
    this.io = io
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id)

      // User joins their personal room
      socket.on("join", (userId: string) => {
        this.userSockets.set(userId, socket.id)
        socket.join(`user:${userId}`)
        console.log(`User ${userId} joined room`)
      })

      // User leaves
      socket.on("disconnect", () => {
        // Find and remove user from map
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId)
            break
          }
        }
        console.log("Client disconnected:", socket.id)
      })
    })
  }

  // Send notification to specific user
  sendToUser(userId: string, notification: Omit<NotificationData, "id" | "userId" | "createdAt" | "read">) {
    const notificationData: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date(),
      read: false,
    }

    // Send to user's room
    this.io.to(`user:${userId}`).emit("notification", notificationData)
    
    console.log(`Notification sent to user ${userId}:`, notificationData.title)
    return notificationData
  }

  // Send notification to all connected users
  broadcast(notification: Omit<NotificationData, "id" | "userId" | "createdAt" | "read">) {
    const notificationData: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: "broadcast",
      createdAt: new Date(),
      read: false,
    }

    this.io.emit("notification", notificationData)
    console.log("Broadcast notification:", notificationData.title)
    return notificationData
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId)
  }
}

// Singleton instance
let notificationService: NotificationService | null = null

export function getNotificationService(io?: SocketIOServer): NotificationService {
  if (!notificationService && io) {
    notificationService = new NotificationService(io)
  }
  if (!notificationService) {
    throw new Error("NotificationService not initialized")
  }
  return notificationService
}
