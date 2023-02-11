import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { ChatGPTAPI } from './chatgpt.js'


dotenv.config()



const port = process.env.PORT || 5000

let conversationId = null, parentMessageId = null

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'This is a Chat Server!'
  })
})

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post('/api/v1/chat', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await api.sendMessage(prompt,{conversationId, parentMessageId});
    conversationId = response.conversationId
    parentMessageId = response.id

    res.status(200).send({
      res: response
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || '有错误发生。');
  }
})

app.listen(5000, () => console.log(`AI server started. Listening on ${port}...`))