import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function MealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const [users] = await knex('user')
        .where('session_id', sessionId)
        .select('id')

      const userId = users.id

      const createNewMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
      })
      const { name, description, isOnDiet } = createNewMealSchema.parse(
        request.body,
      )

      await knex('newMeal').insert({
        id: randomUUID(),
        user_id: userId,
        name,
        description,
        isOnDiet,
      })
      return await reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const [users] = await knex('user')
        .where('session_id', sessionId)
        .select('id')

      const userId = users.id

      const meals = await knex('newmeal').where('user_id', userId).select()
      return {
        meals,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      // Capturando os parâmetros nomeados (/:id)
      // Tipando
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const params = getMealParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const [users] = await knex('user')
        .where('session_id', sessionId)
        .select('id')

      const userId = users.id

      // Buscando a refeição do db
      // Buscando na tabela meals, na coluna ID, o params.id (que é o que vem da rota)
      const meal = await knex('newmeal')
        .where('id', params.id)
        .andWhere('user_id', userId)
        .first()
      return { meal }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const [user] = await knex('user')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const [count] = await knex('newMeal')
        .count('id', {
          as: 'Total de refeições registradas',
        })
        .andWhere('user_id', userId)

      const onDiet = await knex('newMeal')
        .count('id', { as: 'Total de refeições dentro da dieta' })
        .where('isOnDiet', true)
        .andWhere('user_id', userId)

      const offDiet = await knex('newMeal')
        .count('id', { as: 'Total de refeições fora da dieta' })
        .where('isOnDiet', false)
        .andWhere('user_id', userId)

      const allMeals = await knex('newMeal')
        .where('user_id', userId)
        .orderBy('created_at', 'description')
        .select()

      const isOnTheDiet = allMeals.map((meals) => meals.isOnDiet)
      const minSequence = 1
      let counter = 0
      let bestSequence = 0

      for (let i = 0; i < isOnTheDiet.length; i++) {
        if (isOnTheDiet[i] === 1) {
          counter++
        }

        if (isOnTheDiet[i] === 0) {
          if (counter >= minSequence && counter > bestSequence) {
            bestSequence = counter
          }
          counter = 0
        }
        if (counter >= minSequence && counter > bestSequence) {
          bestSequence = counter
          console.log(bestSequence)
        }
      }

      // return {count, onDiet, offDiet, bestSequence}
      const summary = {
        'Total de refeições registradas': parseInt(
          JSON.parse(JSON.stringify(count))['Total de refeições registradas'],
        ),
        'Total de refeições dentro da dieta': parseInt(
          JSON.parse(JSON.stringify(onDiet))[0][
            'Total de refeições dentro da dieta'
          ],
        ),

        'Total de refeições fora da dieta': parseInt(
          JSON.parse(JSON.stringify(offDiet))[0][
            'Total de refeições fora da dieta'
          ],
        ),
        'Melhor sequencia de refeições dentro da dieta': parseInt(
          JSON.parse(JSON.stringify(bestSequence)),
        ),
      }

      return {
        summary,
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const [users] = await knex('user')
        .where('session_id', sessionId)
        .select('id')
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const userId = users.id
      const params = getMealParamsSchema.parse(request.params)

      await knex('newmeal')
        .where('user_id', userId)
        .andWhere('id', params.id)
        .delete()

      return await reply.status(204).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const [user] = await knex('user')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const params = getMealParamsSchema.parse(request.params)

      const editMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
      })

      const { name, description, isOnDiet } = editMealBodySchema.parse(
        request.body,
      )
      const meal = await knex('newmeal')
        .where('user_id', userId)
        .andWhere('id', params.id)
        .first()
        .update({
          name,
          description,
          isOnDiet,
        })

      if (!meal) {
        return await reply.status(401).send({
          error: 'Refeição não encontrada',
        })
      }

      return await reply.status(201).send()
    },
  )
}
