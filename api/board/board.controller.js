import { boardService } from "./board.service.js"
import { loggerService } from "../../services/logger.service.js"
import { asyncLocalStorage } from "../../services/als.service.js"

export async function getBoards(req, res) {
  try {
    loggerService.debug("Getting Boards:", req.query)

    const boards = await boardService.getMiniBoards()
    res.json(boards)
  } catch (err) {
    loggerService.error("Failed to get boards", err)
    res.status(400).send({ err: "Failed to get boards" })
  }
}

export async function getBoard(req, res) {
  try {
    const boardId = req.params.boardId
    const board = await boardService.getById(boardId)
    res.json(board)
  } catch (err) {
    loggerService.error("Failed to get board", err)
    res.status(400).send({ err: "Failed to get board" })
  }
}

export async function removeBoard(req, res) {
  const boardId = req.params.boardId
  try {
    const removedId = await boardService.remove(boardId)
    res.send(removedId)
  } catch (err) {
    loggerService.error("Failed to remove board", err)
    res.status(400).send({ err: "Failed to remove board" })
  }
}

export async function updateBoard(req, res) {
  const boardToUpdate = req.body
  try {
    const updatedBoard = await boardService.update(boardToUpdate)
    res.json(updatedBoard)
  } catch (err) {
    loggerService.error("Failed to get board", err)
    res.status(400).send({ err: "Failed to get board" })
  }
}

export async function addBoard(req, res) {
  const { title, style, labels, activities } = req.body
  const { loggedinUser } = asyncLocalStorage.getStore()

  const boardToSave = {
    title,
    style,
    labels,
    activities,
    isStarred: false,
    archivedAt: null,
    groups: [],
    members: [loggedinUser],
  }

  boardToSave.createdBy = loggedinUser

  try {
    const addedBoard = await boardService.add(boardToSave)
    res.send(addedBoard)
  } catch (error) {
    loggerService.error("Failed to get board", err)
    res.status(400).send({ err: "Failed to get board" })
  }
}
