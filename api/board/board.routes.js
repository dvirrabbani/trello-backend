import express from "express"
import { requireAuth, requireAdmin } from "../../middlewares/auth.middleware.js"
import { addBoard, getBoard, getBoards, removeBoard, updateBoard } from "./board.controller.js"

const router = express.Router()

router.get("/", getBoards)
router.get("/:boardId", getBoard)
router.delete("/:boardId", removeBoard)
router.put("/:boardId", updateBoard)
router.post("/", addBoard)

export const boardRoutes = router
