import { Server } from "socket.io"
import { loggerService } from "./logger.service.js"

var gIo = null

export function setupSocketAPI(http) {
  gIo = new Server(http, { cors: { origin: "*" } })

  gIo.on("connection", (socket) => {
    loggerService.info(`New connected socket [id: ${socket.id}]`)

    socket.on("disconnect", (socket) => {
      loggerService.info(`Socket disconnected [id: ${socket.id}]`)
    })

    socket.on("join-board", (boardId) => {
      if (socket.boardId === boardId) return
      if (socket.boardId) {
        socket.leave(socket.boardId)
        loggerService.info(
          `Socket is leaving board ${socket.boardId} [id: ${socket.id}]`
        )
      }
      socket.join(boardId)
      loggerService.info(`Socket joined board ${boardId} [id: ${socket.id}]`)
      socket.boardId = boardId
    })

    socket.on("leave-board", (boardId) => {
      socket.leave(boardId)
      loggerService.info(`Socket left board ${boardId} [id: ${socket.id}]`)
      socket.boardId = null
    })

    socket.on("set-user-socket", (userId) => {
      loggerService.info(
        `Setting socket.userId = ${userId} for socket [id: ${socket.id}]`
      )
      socket.userId = userId
    })

    socket.on("unset-user-socket", () => {
      loggerService.info(`Removing socket.userId for socket [id: ${socket.id}]`)
      delete socket.userId
    })

    socket.on("add-member", (activity) => {
      console.log("socket-server - add-member", activity)
      emitToUser({
        type: "notification",
        data: activity,
        userId: activity.member.id,
      })
    })
  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to("watching:" + label.toString()).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  userId = userId.toString()
  const socket = await _getUserSocket(userId)

  if (socket) {
    loggerService.info(
      `Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
    )
    socket.emit(type, data)
  } else {
    loggerService.info(`No active socket for user: ${userId}`)
  }
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all

async function broadcast({ type, data, room = null, userId }) {
  loggerService.info(`Broadcasting event: ${type}`)

  userId = userId.toString()
  const excludedSocket = await _getUserSocket(userId)

  if (room && excludedSocket) {
    loggerService.info(`Broadcast to room ${room} excluding user: ${userId}`)
    // type - update-board, data - all groups
    excludedSocket.broadcast.to(room).emit(type, data)
  } else if (excludedSocket) {
    loggerService.info(`Broadcast to all excluding user: ${userId}`)
    excludedSocket.broadcast.emit(type, data)
  } else if (room) {
    loggerService.info(`Emit to room: ${room}`)
    gIo.to(room).emit(type, data)
  } else {
    loggerService.info(`Emit to all`)
    gIo.emit(type, data)
  }
}

async function _getUserSocket(userId) {
  const sockets = await _getAllSockets()
  const socket = sockets.find((s) => s.userId === userId)
  return socket
}
async function _getAllSockets() {
  // return all Socket instances
  const sockets = await gIo.fetchSockets()
  return sockets
}

async function _printSockets() {
  const sockets = await _getAllSockets()
  console.log(`Sockets: (count: ${sockets.length}):`)
  sockets.forEach(_printSocket)
}

function _printSocket(socket) {
  console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

export const socketService = {
  // set up the sockets service and define the API
  setupSocketAPI,
  // emit to everyone / everyone in a specific room (label)
  emitTo,
  // emit to a specific user (if currently active in system)
  emitToUser,
  // Send to all sockets BUT not the current socket - if found
  // (otherwise broadcast to a room / to all)
  broadcast,
}
