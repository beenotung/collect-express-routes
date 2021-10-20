import express from 'express'
import cors from 'cors'
import {
  getRoutes as getSpyRoutes,
  SpyRoute,
  spyRoutes,
  summarize as summarizeSpyRoutes,
} from './spy'

function noop(req: express.Request, res: express.Response) {
  res.json({
    method: req.method,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
  })
}

// let app = express()
const app = express.Router()

// spyRoutes(app)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/users/:id', noop)
app.patch('/users/:id', noop)
app.post('/users', noop)
app.get('/users', noop)

const photos = express.Router()
photos.get('/:id', noop)
photos.patch('/:id', noop)
photos.get('/', noop)
photos.post('/', noop)

app.use('/photos', photos)

const auth = express.Router()
auth.post('/login/google')
auth.post('/login/facebook')
auth.post('/login/password')
app.use(auth)

const root = express()
spyRoutes(root)
root.use('/api/v1', app)

console.log('top level:')
console.log(getSpyRoutes(root))

console.log('summary:')
summarizeSpyRoutes(root)
