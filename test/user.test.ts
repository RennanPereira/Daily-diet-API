import {it, expect, beforeAll, afterAll, describe, beforeEach} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('users routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback ==all')
        execSync('npm run knex migrate:latest')
      })

      afterAll(async () => {
        app.close()
    })

it('should be able to create a user', async () => {
    await request(app.server)
    .post('/user')
    .send({
        userName:'teste',
        password: '12345'
    })
    .expect(201)
})

})