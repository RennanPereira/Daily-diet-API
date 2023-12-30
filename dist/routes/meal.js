var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/meal.ts
var meal_exports = {};
__export(meal_exports, {
  MealRoutes: () => MealRoutes
});
module.exports = __toCommonJS(meal_exports);
var import_zod2 = require("zod");

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = __toESM(require("zod"));
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSschema = import_zod.default.object({
  NODE_ENV: import_zod.default.enum(["development", "test", "production"]).default("production"),
  DATABASE_CLIENT: import_zod.default.enum(["sqlite", "pg"]).default("sqlite"),
  DATABASE_URL: import_zod.default.string(),
  PORT: import_zod.default.number().default(3333)
});
var _env = envSschema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables!", _env.error.format());
  throw new Error("Invalid environment variables.");
}
var env = _env.data;

// src/database.ts
var config2 = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./tmp/migrations"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/routes/meal.ts
var import_crypto = require("crypto");

// src/middlewares/check-session-id-exists.ts
async function checkSessionIdExists(request, reply) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return await reply.status(401).send({
      error: "n\xE3o autorizado!"
    });
  }
}

// src/routes/meal.ts
async function MealRoutes(app) {
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const [users] = await knex("user").where("session_id", sessionId).select("id");
      const userId = users.id;
      const createNewMealSchema = import_zod2.z.object({
        name: import_zod2.z.string(),
        description: import_zod2.z.string(),
        isOnDiet: import_zod2.z.boolean()
      });
      const { name, description, isOnDiet } = createNewMealSchema.parse(
        request.body
      );
      await knex("newMeal").insert({
        id: (0, import_crypto.randomUUID)(),
        user_id: userId,
        name,
        description,
        isOnDiet
      });
      return await reply.status(201).send();
    }
  );
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const [users] = await knex("user").where("session_id", sessionId).select("id");
      const userId = users.id;
      const meals = await knex("newmeal").where("user_id", userId).select();
      return {
        meals
      };
    }
  );
  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const getMealParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid()
      });
      const params = getMealParamsSchema.parse(request.params);
      const { sessionId } = request.cookies;
      const [users] = await knex("user").where("session_id", sessionId).select("id");
      const userId = users.id;
      const meal = await knex("newmeal").where("id", params.id).andWhere("user_id", userId).first();
      return { meal };
    }
  );
  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const [user] = await knex("user").where("session_id", sessionId).select("id");
      const userId = user.id;
      const [count] = await knex("newMeal").count("id", {
        as: "Total de refei\xE7\xF5es registradas"
      }).andWhere("user_id", userId);
      const onDiet = await knex("newMeal").count("id", { as: "Total de refei\xE7\xF5es dentro da dieta" }).where("isOnDiet", true).andWhere("user_id", userId);
      const offDiet = await knex("newMeal").count("id", { as: "Total de refei\xE7\xF5es fora da dieta" }).where("isOnDiet", false).andWhere("user_id", userId);
      const allMeals = await knex("newMeal").where("user_id", userId).orderBy("created_at", "description").select();
      const isOnTheDiet = allMeals.map((meals) => meals.isOnDiet);
      const minSequence = 1;
      let counter = 0;
      let bestSequence = 0;
      for (let i = 0; i < isOnTheDiet.length; i++) {
        if (isOnTheDiet[i] === 1) {
          counter++;
        }
        if (isOnTheDiet[i] === 0) {
          if (counter >= minSequence && counter > bestSequence) {
            bestSequence = counter;
          }
          counter = 0;
        }
        if (counter >= minSequence && counter > bestSequence) {
          bestSequence = counter;
          console.log(bestSequence);
        }
      }
      const summary = {
        "Total de refei\xE7\xF5es registradas": parseInt(
          JSON.parse(JSON.stringify(count))["Total de refei\xE7\xF5es registradas"]
        ),
        "Total de refei\xE7\xF5es dentro da dieta": parseInt(
          JSON.parse(JSON.stringify(onDiet))[0]["Total de refei\xE7\xF5es dentro da dieta"]
        ),
        "Total de refei\xE7\xF5es fora da dieta": parseInt(
          JSON.parse(JSON.stringify(offDiet))[0]["Total de refei\xE7\xF5es fora da dieta"]
        ),
        "Melhor sequencia de refei\xE7\xF5es dentro da dieta": parseInt(
          JSON.parse(JSON.stringify(bestSequence))
        )
      };
      return {
        summary
      };
    }
  );
  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const [users] = await knex("user").where("session_id", sessionId).select("id");
      const getMealParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid()
      });
      const userId = users.id;
      const params = getMealParamsSchema.parse(request.params);
      await knex("newmeal").where("user_id", userId).andWhere("id", params.id).delete();
      return await reply.status(204).send();
    }
  );
  app.put(
    "/:id",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const [user] = await knex("user").where("session_id", sessionId).select("id");
      const userId = user.id;
      const getMealParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid()
      });
      const params = getMealParamsSchema.parse(request.params);
      const editMealBodySchema = import_zod2.z.object({
        name: import_zod2.z.string(),
        description: import_zod2.z.string(),
        isOnDiet: import_zod2.z.boolean()
      });
      const { name, description, isOnDiet } = editMealBodySchema.parse(
        request.body
      );
      const meal = await knex("newmeal").where("user_id", userId).andWhere("id", params.id).first().update({
        name,
        description,
        isOnDiet
      });
      if (!meal) {
        return await reply.status(401).send({
          error: "Refei\xE7\xE3o n\xE3o encontrada"
        });
      }
      return await reply.status(201).send();
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MealRoutes
});