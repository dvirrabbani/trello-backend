import express from "express"
import { requireAuth } from "../../middlewares/auth.middleware.js"
import {
  addBoard,
  getBoard,
  getBoards,
  removeBoard,
  updateBoard,
} from "./board.controller.js"

const router = express.Router()

router.get("/", getBoards)
router.get("/:boardId", getBoard)
router.delete("/:boardId", requireAuth, removeBoard)
router.put("/:boardId", requireAuth, updateBoard)
router.post("/", requireAuth, addBoard)

export const boardRoutes = router
