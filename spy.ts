import express, { IRouter } from 'express'
import { join } from './path'

export type SpyRoute = { method: string; path: string }

const Router = express.Router
const SpyRouter: typeof Router = function SpyRouter(...args) {
  const router = Router(...args)
  spyRoutes(router)
  return router
}

const spyMethods = [
  'use',
  'all',
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
] as const

export function spyRoutes(app: IRouter) {
  if (express.Router !== SpyRouter) {
    express.Router = SpyRouter
  }

  const spyRoutes: SpyRoute[] = []
  Object.assign(app, { spyRoutes: spyRoutes })

  function makeSpy(method: string) {
    return function spy(...args: any[]) {
      if (args[0] === 'query parser fn') {
        // this is called when using app.route(path)
        return app
      }
      let accPath = '/'
      for (const arg of args) {
        if (typeof arg === 'string') {
          accPath = join(accPath, arg)
        } else if (arg.spyRoutes) {
          for (let route of arg.spyRoutes) {
            route = { method: route.method, path: join(accPath, route.path) }
            spyRoutes.push(route)
          }
          return app
        }
      }

      if ((method === 'use' || method === 'all') && accPath === '/') {
        // only generic middleware, not API routes
        return app
      }
      const route = { method, path: accPath }
      spyRoutes.push(route)

      return app
    }
  }

  for (const method of spyMethods) {
    app[method] = makeSpy(method)
  }

  {
    const Route = app.route.bind(app)
    function spyRoute(path: string) {
      const route = Route(path)
      for (const method of spyMethods) {
        if (method === 'use') {
          // use is not a method on app.route
          continue
        }
        route[method] = function() {
          spyRoutes.push({ method, path })
          return route
        }
      }
      return route
    }
    app.route = spyRoute
  }
}

export function getSpyRoutes(app: IRouter): SpyRoute[] {
  return (app as any).spyRoutes || []
}

export function groupRoutesByPath(spyRoutes: SpyRoute[]) {
  const paths_methods: Record<string, string[]> = {}
  for (const { method, path } of spyRoutes) {
    const methods = paths_methods[path] || (paths_methods[path] = [])
    methods.push(method)
  }
  return paths_methods
}
