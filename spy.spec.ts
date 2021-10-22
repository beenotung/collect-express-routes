import { expect } from 'chai'
import express from 'express'
import { groupRoutesByPath, getSpyRoutes, spyRoutes } from './spy'

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
  // const print = console.log

  function get(object: any, key: string) {
    return object[key]
  }

  context('spy on each router methods', () => {
    const methods: Array<keyof ReturnType<typeof express.Router>> = [
      'use',
      'all',
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'options',
      'head',
    ]
    for (const method of methods) {
      it(`should spy on '${method}' method`, () => {
        const app = express.Router()
        spyRoutes(app)
        get(app, method)('/user/:id', noop)
        expect(getSpyRoutes(app)).to.deep.equals([
          { method, path: '/user/:id' },
        ])
      })
    }
  })

  context('spy on multiple router methods', () => {
    it('should collect all routes', () => {
      const app = express.Router()
      spyRoutes(app)
      app.get('/users', noop)
      app.post('/users', noop)
      app.get('/users/:id', noop)
      app.delete('/users/:id', noop)
      expect(getSpyRoutes(app)).to.deep.equals([
        { path: '/users', method: 'get' },
        { path: '/users', method: 'post' },
        { path: '/users/:id', method: 'get' },
        { path: '/users/:id', method: 'delete' },
      ])
    })
  })

  context('test with nested routes and middleware', () => {
    let app: express.Application

    before(() => {
      const routes = express.Router()
      spyRoutes(routes)

      routes.use(express.json())
      routes.use(express.urlencoded({ extended: false }))

      // direct routes
      routes.get('/users/:id', noop)
      routes.patch('/users/:id', noop)
      routes.post('/users', noop)
      routes.get('/users', noop)

      // sub-routes without url param
      const auth = express.Router()
      auth.post('/login/google')
      auth.post('/login/facebook')
      auth.post('/login/password')
      routes.use(auth)

      // sub-routes with url param
      const photos = express.Router()
      photos.get('/:id', noop)
      photos.patch('/:id', noop)
      photos.get('/', noop)
      photos.post('/', noop)
      routes.use('/photos', photos)

      app = express()
      spyRoutes(app)
      app.use('/api/v1', routes)
    })

    it('should spy on typical express app', () => {
      expect(getSpyRoutes(app)).to.deep.equals([
        // direct routes
        { method: 'get', path: '/api/v1/users/:id' },
        { method: 'patch', path: '/api/v1/users/:id' },
        { method: 'post', path: '/api/v1/users' },
        { method: 'get', path: '/api/v1/users' },
        // sub-routes without url param
        { method: 'post', path: '/api/v1/login/google' },
        { method: 'post', path: '/api/v1/login/facebook' },
        { method: 'post', path: '/api/v1/login/password' },
        // sub-routes with url param
        { method: 'get', path: '/api/v1/photos/:id' },
        { method: 'patch', path: '/api/v1/photos/:id' },
        { method: 'get', path: '/api/v1/photos' },
        { method: 'post', path: '/api/v1/photos' },
      ])
    })

    it('should group routes by path and list methods', () => {
      expect(groupRoutesByPath(getSpyRoutes(app))).to.deep.equals({
        // direct routes
        '/api/v1/users/:id': ['get', 'patch'],
        '/api/v1/users': ['post', 'get'],
        // sub-routes without url param
        '/api/v1/login/google': ['post'],
        '/api/v1/login/facebook': ['post'],
        '/api/v1/login/password': ['post'],
        // sub-routes with url param
        '/api/v1/photos/:id': ['get', 'patch'],
        '/api/v1/photos': ['get', 'post'],
      })
    })
  })
})
