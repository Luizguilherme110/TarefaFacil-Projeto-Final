import express from 'express'
import { receberLog } from '../controllers/logController.js'

const router = express.Router()

router.post('/', receberLog)

export default router
