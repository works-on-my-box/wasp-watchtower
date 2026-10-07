import { app, page, route, query, action, job } from "@wasp.sh/spec";
import { DashboardPage } from "./src/DashboardPage" with { type: "ref" };
import { LoginPage } from "./src/auth/LoginPage" with { type: "ref" };
import { SignupPage } from "./src/auth/SignupPage" with { type: "ref" };
import { getSites, addSite } from "./src/operations" with { type: "ref" };
import { checkSites } from "./src/jobs" with { type: "ref" };

export default app({
  name: "Watchtower",
  wasp: { version: "^0.25.0" },
  title: "Watchtower",
  head: ["<link rel='icon' href='/favicon.ico' />"],
  auth: {
    userEntity: "User",
    methods: {
      // Самый простой метод: логин и пароль.
      usernameAndPassword: {},
    },
    onAuthSucceededRedirectTo: "/",
    onAuthFailedRedirectTo: "/login",
  },
  emailSender: {
    // Dummy-провайдер печатает письма в консоль сервера — внешняя почта в dev не нужна.
    // TODO: для продакшена заменить на Resend (provider: "Resend", apiKey из env).
    provider: "Dummy",
  },
  spec: [
    route("DashboardRoute", "/", page(DashboardPage, { authRequired: true })),
    route("LoginRoute", "/login", page(LoginPage)),
    route("SignupRoute", "/signup", page(SignupPage)),
    query(getSites, { entities: ["Site", "Check"] }),
    action(addSite, { entities: ["Site"] }),
    // PgBoss-джоб: каждые 10 минут обходит сайты и пишет Check.
    job(checkSites, {
      executor: "PgBoss",
      entities: ["Site", "Check"],
      schedule: { cron: "*/10 * * * *" },
    }),
  ],
});
