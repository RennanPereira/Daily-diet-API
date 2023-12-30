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

// src/routes/user.ts
var user_exports = {};
__export(user_exports, {
  UserRoutes: () => UserRoutes
});
module.exports = __toCommonJS(user_exports);
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

// src/routes/user.ts
var import_crypto = require("crypto");
async function UserRoutes(app) {
  app.post("/", async (request, reply) => {
    const createUsersBodySchema = import_zod2.z.object({
      userName: import_zod2.z.string(),
      password: import_zod2.z.string()
    });
    const { userName, password } = createUsersBodySchema.parse(request.body);
    const checkUserExist = await knex.select("*").from("user").where("userName", userName).first();
    if (checkUserExist) {
      return await reply.status(400).send({
        error: "Este nome de usu\xE1rio j\xE1 existe"
      });
    }
    let sessionId = request.cookies.sessionId;
    if (!sessionId) {
      sessionId = (0, import_crypto.randomUUID)();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1e3 * 60 * 60 * 24 * 7
        // 7 days
      });
    }
    await knex("user").insert({
      id: (0, import_crypto.randomUUID)(),
      userName,
      password,
      session_id: sessionId
    });
    return await reply.status(201).send();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UserRoutes
});
