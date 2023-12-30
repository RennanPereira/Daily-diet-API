import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe('meal routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback ==all')
        execSync('npm run knex migrate:latest')
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to create a new meal', async() => {
        const createUserResponse = await request(app.server)
        .post('/user')
        .send({
            userName: 'teste',
            password: '12345'
        })
        const cookies = createUserResponse.get('Set-Cookie')

        const createMealResponse = await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'Jantar',
            description: 'Pizza com coca cola',
            isOnDiet: false
        })
        .expect(201)
    })

    it('should be able to list all meals', async() => {
        const createUserResponse = await request(app.server)
        .post('/user')
        .send({
            userName: 'teste',
            password: '12345'
        })
        const cookies = createUserResponse.get('Set-Cookie')

        const userId = createUserResponse.body.id

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'Jantar',
            description: 'Pizza com coca cola',
            isOnDiet: false
        })

        const listAllMealsResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .send({'user_id': userId})
        .expect(200)

        expect(listAllMealsResponse.body.meals).toEqual([
            expect.objectContaining({
                name:'Jantar',
                description: 'Pizza com coca cola',
            
            })
        ])
    })

    it('should be able to get a specific meal', async () => {
        const createUserResponse = await request(app.server)
        .post('/user')
        .send({
            userName: 'teste',
            password: '12345'
        })
        const cookies = createUserResponse.get('Set-Cookie')

        const userId = createUserResponse.body.id

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'Jantar',
            description: 'Pizza com coca cola',
            isOnDiet: false
        })
        const listMealsResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .send({'user_id': userId})
        .expect(200)

        const mealId = listMealsResponse.body.meals[0].id

        const getMealResponse = await request(app.server)
        .get(`/meal/${mealId}`)
        .set('Cookie', cookies)
        .send({'user_id': userId})
        .expect(200)

        expect(getMealResponse.body.meal).toEqual(
            expect.objectContaining({
                name:'Jantar',
                description: 'Pizza com coca cola',
            })
        )
    })
    it('should be able to delete a meal', async() => {
        const createUserResponse = await request(app.server)
        .post('/user')
        .send({
            userName: 'teste',
            password: '12345'
        })
        const cookies = createUserResponse.get('Set-Cookie')

        const userId = createUserResponse.body.id

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'Jantar',
            description: 'Pizza com coca cola',
            isOnDiet: false
        })
        const listMealsResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .send({'user_id': userId})
        .expect(200)
        
        const mealId = listMealsResponse.body.meals[0].id

        await request(app.server)
        .delete(`/meal/${mealId}`)
        .set('Cookie', cookies)
        .expect(204)
    })

    it('should be able to get the summary', async() => {
        const createUserResponse = await request(app.server)
        .post('/user')
        .send({
            userName: 'teste',
            password: '12345'
        })
        const cookies = createUserResponse.get('Set-Cookie')

        const userId = createUserResponse.body.id

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'café da manha',
            description: 'café com pão',
            isOnDiet: true
        })

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'almoço',
            description: 'arroz, salada e frango',
            isOnDiet: true
        })

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'Jantar',
            description: 'Pizza com coca cola',
            isOnDiet: false
        })

        const getMealResponse = await request(app.server)
        .get('/meal/summary')
        .set('Cookie', cookies)
        .send({'user_id': userId})
        .expect(200)

        expect(getMealResponse.body.summary).toEqual(
            expect.objectContaining({
                "Total de refeições registradas": 3,
		        "Total de refeições dentro da dieta": 2,
		        "Total de refeições fora da dieta": 1,
		        "Melhor sequencia de refeições dentro da dieta": 2
            })
        )
    })

    it('should be able to update a meal', async() => {
        const createUserResponse = await request(app.server)
        .post('/user')
        .send({
            userName: 'teste',
            password: '12345'
        })
        const cookies = createUserResponse.get('Set-Cookie')

        const userId = createUserResponse.body.id

        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name:'Jantar',
            description: 'Pizza com coca cola',
            isOnDiet: false
        })
        const listMealsResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .send({'user_id': userId})
        .expect(200)
        
        const mealId = listMealsResponse.body.meals[0].id

        await request(app.server)
        .put(`/meal/${mealId}`)
        .set('Cookie', cookies)
        .send({
            name:'almoço',
            description: 'arroz, salada e frango',
            isOnDiet: true
        })
        .expect(201)
    
    })

})