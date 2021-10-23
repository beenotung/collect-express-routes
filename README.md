# collect-express-routes

Collect all API routes in Express Application / Router

[![npm Package Version](https://img.shields.io/npm/v/collect-express-routes.svg?maxAge=2592000)](https://www.npmjs.com/package/collect-express-routes)

This package helps to make "sitemap" of the APIs.

## Features

- Support spying `express()` application and `express.Router()`
- Support chainable route handlers (`app.route`)
- Optionally group collected API routes by path (of different HTTP methods)

## Usage Example

```typescript
import express, { Request, Response } from 'express'
import {
  groupRoutesByPath,
  getSpyRoutes,
  spyRoutes,
} from 'collect-express-routes'

let app = express()
spyRoutes(app)

app.use(express.json())

// direct routing is supported
app.get('/users', echo)
app.post('/users', echo)
app.get('/users/:id', echo)
app.patch('/users/:id', echo)
app.delete('/users/:id', echo)

// using router is also supported
let memoRouter = express.Router()
memoRouter.post('/', echo)
memoRouter.get('/:id', echo)
memoRouter.patch('/:id', echo)
memoRouter.delete('/:id', echo)
app.use('/memo', memoRouter)

// chainable route handlers are also supported
app
  .route('/book')
  .get(echo) // alias for app.get('/book', echo)
  .post(echo) // alias for app.post('/book', echo)

console.log(getSpyRoutes(app))
/* output:
[
  { method: 'get', path: '/users' },
  { method: 'post', path: '/users' },
  { method: 'get', path: '/users/:id' },
  { method: 'patch', path: '/users/:id' },
  { method: 'delete', path: '/users/:id' },
  { method: 'post', path: '/memo' },
  { method: 'get', path: '/memo/:id' },
  { method: 'patch', path: '/memo/:id' },
  { method: 'delete', path: '/memo/:id' }
  { method: 'get', path: '/book' },
  { method: 'post', path: '/book' },
]
*/

console.log(groupRoutesByPath(getSpyRoutes(app)))
/* output:
{
  '/users': [ 'get', 'post' ],
  '/users/:id': [ 'get', 'patch', 'delete' ],
  '/memo': [ 'post' ],
  '/memo/:id': [ 'get', 'patch', 'delete' ],
  '/book': [ 'get', 'post' ]
}
*/

function echo(req: Request, res: Response) {
  res.json({ method: req.method, path: req.path })
}
```

Details see [spy.spec.ts](./spy.spec.ts)

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
