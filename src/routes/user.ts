import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function UserRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUsersBodySchema = z.object({
      userName: z.string(),
      password: z.string(),
    })
    const { userName, password } = createUsersBodySchema.parse(request.body)

    const checkUserExist = await knex
      .select('*')
      .from('user')
      .where('userName', userName)
      .first()

    if (checkUserExist) {
      return await reply.status(400).send({
        error: 'Este nome de usuário já existe',
      })
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('user').insert({
      id: randomUUID(),
      userName,
      password,
      session_id: sessionId,
    })
    return await reply.status(201).send()
  })
}
