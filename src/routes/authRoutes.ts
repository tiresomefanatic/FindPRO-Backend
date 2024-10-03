import express from "express";
import passport from "../auth/passport";
import User from "../models/usersModel";
import {
  setAuthenticated,
  refreshAccessToken,
  logout,
} from "../controllers/authController";
import { authMiddleware } from "../auth/protected";

const router = express.Router();

router.get("/google-login", (req, res) => {
  res.redirect("/auth/google");
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://find-pro-client.vercel.app/login",
    session: false,
  }),
  (req, res) => {
    try {
      const { accessToken, isNewUser, userId, name } = req.user;
      if (isNewUser) {
        res.redirect(`https://find-pro-client.vercel.app/register?userId=${userId}&userName=${encodeURIComponent(name)}&accessToken=${accessToken}`);
        //res.redirect(`http://localhost:3000/register?userId=${userId}&userName=${encodeURIComponent(name)}&accessToken=${accessToken}`);

      } else {
        res.redirect(
          `https://find-pro-client.vercel.app/loginSuccess?accessToken=${accessToken}`
          //`http://localhost:3000/loginSuccess?accessToken=${accessToken}`

        );
      }
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/setAuthenticated", authMiddleware, setAuthenticated);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authMiddleware, logout);

export default router;
