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
      // The simplest method: username and password.
      usernameAndPassword: {},
    },
    onAuthSucceededRedirectTo: "/",
    onAuthFailedRedirectTo: "/login",
  },
  emailSender: {
    // The Dummy provider prints emails to the server console, so dev needs no mail service.
    // TODO: switch to Resend for production (provider: "Resend", API key from env).
    provider: "Dummy",
  },
  spec: [
    route("DashboardRoute", "/", page(DashboardPage, { authRequired: true })),
    route("LoginRoute", "/login", page(LoginPage)),
    route("SignupRoute", "/signup", page(SignupPage)),
    query(getSites, { entities: ["Site", "Check"] }),
    action(addSite, { entities: ["Site"] }),
    // PgBoss job: every 10 minutes it checks all sites and writes a Check row.
    job(checkSites, {
      executor: "PgBoss",
      entities: ["Site", "Check"],
      schedule: { cron: "*/10 * * * *" },
    }),
  ],
});
