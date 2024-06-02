import mongoDB from "mongodb"
const { MongoClient } = mongoDB

import { config } from "../config/index.js"
import { loggerService } from "./logger.service.js"

export const dbService = {
  getCollection,
}

var dbConn = null

// get a collection in the board-tracker db (board, user)
async function getCollection(collectionName) {
  try {
    const db = await _connect()
    const collection = await db.collection(collectionName)
    return collection
  } catch (err) {
    loggerService.error(`Failed to get ${collectionName} db collection`, err)
    throw err
  }
}

// connect to the board-tracker db only once
async function _connect() {
  if (dbConn) return dbConn
  try {
    const client = await MongoClient.connect(config.dbURL)
    dbConn = client.db(config.dbName)
    return dbConn
  } catch (err) {
    loggerService.error("Cannot Connect to DB", err)
    throw err
  }
}
