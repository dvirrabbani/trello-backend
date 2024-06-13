import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { userService } from "./api/user/user.service.js"
import { authService } from "./api/auth/auth.service.js"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      const { name, picture, email } = profile._json

      let user = await userService.getByEmail(email)
      try {
        if (!user) {
          user = await userService.addGoogleUser({ fullName: name, username: name, imgUrl: picture, email })
          await user.save()
          const loginToken = authService.getLoginToken(user)
          res.cookie("loginToken", loginToken, { sameSite: "None", secure: true })
        }
      } catch (error) {
        done(error, null)
      }

      done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})
