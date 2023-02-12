import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { ChatGPTAPI } from './chatgpt.js'
import bearerToken from 'express-bearer-token'


dotenv.config()



const port = process.env.PORT || 5000

let conversationId = null, parentMessageId = null

const app = express()
app.use(cors())
app.use(express.json())
app.use(bearerToken({
  bodyKey: 'access_token',
  queryKey: 'access_token',
  headerKey: 'Bearer',
  reqKey: 'token',
  cookie: false, // by default is disabled
}))

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'This is a Chat Server!'
  })
})

const api = new ChatGPTAPI({
  apiKey: "anthing"
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    api._apiKey = req.token;

    const response = await api.sendMessage(prompt,{conversationId, parentMessageId});
    conversationId = response.conversationId
    parentMessageId = response.id

    res.status(200).send({
      res: response
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong.');
  }
})

app.listen(5000, () => console.log(`AI server started. Listening on ${port}...`))