import express from "express"
import passport from "passport"
import { userService } from "../user/user.service.js"
import { authService } from "../auth/auth.service.js"
import { loggerService } from "../../services/logger.service.js"

import { login, signup, logout } from "./auth.controller.js"

export const authRoutes = express.Router()

authRoutes.post("/login", login)
authRoutes.post("/signup", signup)
authRoutes.post("/logout", logout)
// Google
authRoutes.get("/google/login/success", async (req, res) => {
  // set login cookie from google user req
  if (req.user) {
    loggerService.info(req.user._json)
    const { email } = req.user._json
    const googleUser = await userService.getByEmail(email)
    const loginToken = authService.getLoginToken(googleUser)
    loggerService.info("User login: ", googleUser)
    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true })
    res.json({ user: googleUser })
  } else {
    res.status(401).send({ err: "Failed to Login" })
  }
})

authRoutes.get("/google/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  })
})

authRoutes.get("/google", passport.authenticate("google", ["profile", "email"]))

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "google/login/failed",
  })
)

authRoutes.get("/google/logout", (req, res) => {
  req.logout()
  res.redirect(process.env.CLIENT_URL)
})
