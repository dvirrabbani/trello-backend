import { ObjectId } from "mongodb"
import { loggerService } from "../../services/logger.service.js"
import { dbService } from "../../services/db.service.js"

export const userService = {
  query,
  getById,
  remove,
  getByUsername,
  getByEmail,
  update,
  add,
}

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection("user")
    let users = await collection.find(criteria).toArray()
    users = users.map((user) => {
      delete user.password
      user.createdAt = new ObjectId(user._id).getTimestamp()
      // Returning fake fresh data
      // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
      return user
    })
    return users
  } catch (err) {
    loggerService.error("cannot find users", err)
    throw err
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection("user")
    const user = await collection.findOne({ _id: new ObjectId(userId) })

    delete user.password

    return user
  } catch (err) {
    loggerService.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection("user")
    await collection.deleteOne({ _id: new ObjectId(userId) })
  } catch (err) {
    loggerService.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection("user")
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    loggerService.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function getByEmail(email) {
  try {
    const collection = await dbService.getCollection("user")
    const user = await collection.findOne({ email })
    return user
  } catch (err) {
    loggerService.error(`while finding user by email: ${email}`, err)
    throw err
  }
}

async function add(user) {
  try {
    // peek only updatable fields!
    const { fullName, username, password, imgUrl, email } = user
    const userToCreate = {
      email,
      username,
      fullName,
      password,
      imgUrl,
      recentBoards: [],
      createdAt: Date.now(),
    }
    const collection = await dbService.getCollection("user")
    await collection.insertOne(userToCreate)
    return userToCreate
  } catch (err) {
    loggerService.error("cannot create user", err)
    throw err
  }
}

async function update(user) {
  try {
    const { fullName, username, imgUrl, recentBoards } = user
    // peek only updatable properties
    const userToUpdate = {
      _id: new ObjectId(user._id),
      fullName,
      username,
      imgUrl,
      recentBoards,
    }
    const collection = await dbService.getCollection("user")
    await collection.updateOne({ _id: userToUpdate._id }, { $set: userToUpdate })
    return userToUpdate
  } catch (err) {
    loggerService.error(`cannot update user ${user?._id}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" }
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullName: txtCriteria,
      },
    ]
  }

  return criteria
}
