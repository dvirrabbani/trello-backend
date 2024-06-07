import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { asyncLocalStorage } from "../../services/als.service.js"

const COLL_NAME = "board"
const collection = await dbService.getCollection(COLL_NAME)

export const boardService = {
  query,
  getById,
  remove,
  add,
  update,
  getMiniBoards,
}

async function query(filterBy = { txt: "" }) {
  try {
    const criteria = {
      title: { $regex: filterBy.txt, $options: "i" },
    }
    const boards = await collection.find(criteria).toArray()

    return boards
  } catch (err) {
    loggerService.error("cannot find boards", err)
    throw err
  }
}

async function getById(boardId) {
  try {
    const board = await collection.findOne({ _id: new ObjectId(boardId) })
    return board
  } catch (err) {
    loggerService.error(`while finding board ${boardId}`, err)
    throw err
  }
}

async function remove(boardId) {
  try {
    await collection.deleteOne({
      _id: new ObjectId(boardId),
    })
    return boardId
  } catch (err) {
    loggerService.error(`cannot remove board ${boardId}`, err)
    throw err
  }
}

async function update(board) {
  try {
    const {
      title,
      style,
      isStarred,
      archivedAt,
      createdBy,
      labels,
      members,
      groups,
      activities,
    } = board
    const boardToSave = {
      title,
      style,
      isStarred,
      archivedAt,
      createdBy,
      labels,
      members,
      groups,
      activities,
    }

    await collection.updateOne(
      { _id: new ObjectId(board._id) },
      { $set: boardToSave }
    )
    return board
  } catch (err) {
    loggerService.error(`cannot update board ${board?._id}`, err)
    throw err
  }
}

async function add(board) {
  try {
    await collection.insertOne(board)
    return board
  } catch (err) {
    loggerService.error("cannot insert board", err)
    throw err
  }
}

async function getMiniBoards() {
  try {
    const collection = await dbService.getCollection("board")
    const boards = await collection.find().toArray()
    console.log("mini boards length", boards.length)
    return boards.map((board) => ({
      _id: board._id,
      title: board.title,
      style: board.style,
      isStarred: board.isStarred,
    }))
  } catch (err) {
    logger.error("cannot find boards", err)
    throw err
  }
}
