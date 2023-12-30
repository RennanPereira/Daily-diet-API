declare module 'knex/types/tables' {
  export interface tables {
    users: {
      id: string
      userName: string
      password: string
      session_id?: string
    }
    newMeal: {
      id: string
      user_id: string
      name: string
      description: string
      isOnDiet: boolean
      created_at: string
    }
  }
}
