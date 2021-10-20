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
}

export function getRoutes(app: IRouter): SpyRoute[] {
  return (app as any).spyRoutes || []
}

export function summarize(app: IRouter) {
  const spyRoutes: SpyRoute[] = getRoutes(app)
  const paths_methods: Record<string, string[]> = {}
  for (const { method, path } of spyRoutes) {
    const methods = paths_methods[path] || (paths_methods[path] = [])
    methods.push(method)
  }
  // eslint-disable-next-line no-console
  console.log(paths_methods)
}