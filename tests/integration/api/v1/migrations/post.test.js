import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Posting to endpoint", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(response1.status).toBe(403);
    });
  });

  describe("Default user", () => {
    test("Posting to endpoint", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(response1.status).toBe(403);
    });
  });

  describe("Privileged user", () => {
    test("With 'create:migration'", async () => {
      let privilegedUserSessionObject;
      const privilegedUser = await orchestrator.createUser();
      const activatedPrivilegedUser =
        await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(activatedPrivilegedUser, [
        "create:migration",
      ]);
      privilegedUserSessionObject = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );

      const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
        headers: {
          Cookie: `session_id=${privilegedUserSessionObject.token}`,
        },
      });
      expect(response1.status).toBe(200);

      const response1Body = await response1.json();

      expect(Array.isArray(response1Body)).toBe(true);
    });
  });
});
