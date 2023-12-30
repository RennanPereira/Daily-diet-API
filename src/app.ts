import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { UserRoutes } from './routes/user'
import { MealRoutes } from './routes/meal'

export const app = fastify()

app.register(cookie)

app.register(UserRoutes, {
  prefix: '/user',
})

app.register(MealRoutes, {
  prefix: '/meal',
})
