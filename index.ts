import express from 'express'
import cors from 'cors'
import { join } from 'path'

type SpyRoute = { method: string; path: string }
function spyRoutes(app: express.Application | express.Router) {
  let spyRoutes: SpyRoute[] = []
  Object.assign(app, { spyRoutes: spyRoutes })
  function makeSpy(method: string) {
    return function spy(...args: any[]) {
      console.log(method, args)
      let path = '/'
      for (let arg of args) {
        if (typeof arg === 'string') {
          path = join(path, arg)
        } else if (arg.spyRoutes) {
          console.log('router:', arg)
          for (let route of arg.spyRoutes) {
            route = { method: route.method, path: join(path, route.path) }
            console.log(route)
            spyRoutes.push(route)
          }
          return app
        }
      }
      if (method === 'use' && path === '/') {
        // only generic middleware, not API routes
        return app
      }
      let route = { method, path }
      console.log(route)
      spyRoutes.push(route)

      return app
    }
  }

  let methods = [
    'use',
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
  ] as const
  for (let method of methods) {
    app[method] = makeSpy(method)
  }
}
let Router = express.Router
express.Router = function (...args) {
  let router = Router(...args)
  spyRoutes(router)
  return router
}

function noop(req: express.Request, res: express.Response) {
  res.json({
    method: req.method,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
  })
}

// let app = express()
let app = express.Router()

// spyRoutes(app)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/users/:id', noop)
app.patch('/users/:id', noop)
app.post('/users', noop)
app.get('/users', noop)

let photos = express.Router()
photos.get('/:id', noop)
photos.patch('/:id', noop)
photos.get('/', noop)
photos.post('/', noop)

app.use('/photos', photos)

let auth = express.Router()
auth.post('/login/google')
auth.post('/login/facebook')
auth.post('/login/password')
app.use(auth)

let root = express()
spyRoutes(root)
root.use('/api/v1', app)

// let port = 8100
// app.listen(port)

// function listEndpoints(app: express.Application) {
//   console.log('app:', app)
//   let mountpath = app.mountpath
//   let stack = app._router.stack
//   console.log({
//     mountpath,
//     stack,
//   })
//   for (let layer of stack) {
//     if (layer.route) {
//       console.log('layer.route:', layer.route)
//       let { path, stack, methods } = layer.route
//       console.log('layer.route:', { path, methods })
//       for (let layer of stack) {
//       }
//       // let {path,methods} = layer.route
//       // console.log({path,methods})
//     } else if (layer.name === 'router') {
//       console.log('router layer:', layer)
//       console.log('layer.handle.stack:', layer.handle.stack)
//     }
//   }
// }

// listEndpoints(app)

function get(o: object, key: string) {
  return (o as any)[key]
}

console.log('top level:')
console.log(get(root, 'spyRoutes'))

function summarize(app: express.Application | express.Router) {
  let spyRoutes: SpyRoute[] = get(app, 'spyRoutes')
  let paths_methods: Record<string, string[]> = {}
  for (let { method, path } of spyRoutes) {
    let methods = paths_methods[path] || (paths_methods[path] = [])
    methods.push(method)
  }
  console.log(paths_methods)
}

console.log('summary:')
summarize(root)
