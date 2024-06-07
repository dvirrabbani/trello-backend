import { authService } from "./auth.service.js"
import { loggerService } from "../../services/logger.service.js"

export async function login(req, res) {
  const { email, password } = req.body
  try {
    const user = await authService.login(email, password)
    const loginToken = authService.getLoginToken(user)

    loggerService.info("User login: ", user)
    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true })

    res.json(user)
  } catch (err) {
    loggerService.error("Failed to Login " + err)
    res.status(401).send({ err: "Failed to Login" })
  }
}

export async function signup(req, res) {
  try {
    const { email, username, fullName, password, imgUrl } = req.body

    // IMPORTANT!!!
    // Never write passwords to log file!!!
    //loggerService.debug(fullName + ', ' + username + ', ' + password)

    const account = await authService.signup(
      email,
      username,
      fullName,
      imgUrl,
      password
    )
    loggerService.debug(
      `auth.route - new account created: ` + JSON.stringify(account)
    )

    const user = await authService.login(email, password)
    const loginToken = authService.getLoginToken(user)

    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true })
    res.json(user)
  } catch (err) {
    loggerService.error("Failed to signup " + err)
    res.status(500).send({ err: "Failed to signup" })
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("loginToken")
    res.send({ msg: "Logged out successfully" })
  } catch (err) {
    res.status(500).send({ err: "Failed to logout" })
  }
}
