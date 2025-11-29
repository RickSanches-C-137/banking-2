import { Router } from "express";
import UserController from "./users.controller";

const controller = new UserController()
const router = Router()

router.post('/users/signup', controller.signUp)
router.post('/users/signin', controller.signIn)
router.post('/users/waitlist', controller.waitlist)
export default router;