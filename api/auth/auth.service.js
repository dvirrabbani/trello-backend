import Cryptr from "cryptr"
import bcrypt from "bcrypt"

import { userService } from "../user/user.service.js"
import { loggerService } from "../../services/logger.service.js"

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken,
}

const cryptr = new Cryptr(process.env.SECRET1 || "Secret-Puk-1234")

async function login(email, password) {
  loggerService.debug(`auth.service - login with email: ${email}`)

  const user = await userService.getByEmail(email)
  if (!user) throw new Error("Invalid email or password")

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error("Invalid email or password")

  const userToLogin = { ...user }
  delete userToLogin.password

  return userToLogin
}

async function signup(email, username, fullName, imgUrl = "", password) {
  const saltRounds = 10

  console.log({ email, username, password, fullName, imgUrl })
  loggerService.debug(`auth.service - signup with username: ${username}, fullName: ${fullName}`)
  if (!email || !username || !password || !fullName) throw new Error("Missing details")

  const hash = await bcrypt.hash(password, saltRounds)
  return userService.add({ email, username, fullName, imgUrl, password: hash })
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    imgUrl: user.imgUrl,
    isAdmin: user.isAdmin,
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken)
    const loggedinUser = JSON.parse(json)
    return loggedinUser
  } catch (err) {
    loggerService.warn("Invalid login token")
  }
}
