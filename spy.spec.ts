import express from 'express'
import cors from 'cors'
import {
  getRoutes as getSpyRoutes,
  spyRoutes,
  summarize as summarizeSpyRoutes,
} from './spy'
import { expect } from 'chai'

describe('spy.ts TestSuit', () => {
  function noop(req: express.Request, res: express.Response) {
    res.json({
      method: req.method,
      url: req.url,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
    })
  }

  // eslint-disable-next-line no-console
  const print = console.log

  it('should spy the routes', () => {
    // let app = express()
    const app = express.Router()

    spyRoutes(app)

    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    app.get('/users/:id', noop)
    expect(getSpyRoutes(app)).to.deep.contains({
      method: 'get',
      path: '/users/:id',
    })
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

    print('top level:')
    print(getSpyRoutes(root))

    print('summary:')
    summarizeSpyRoutes(root)

    expect(getSpyRoutes(root)).to.deep.contains({
      method: 'get',
      path: '/api/v1/users/:id',
    })
  })
})
