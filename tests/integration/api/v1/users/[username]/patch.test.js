import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        { method: "PATCH" },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@mail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@mail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@mail.com",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const uniqueUser1 = await orchestrator.createUser({
        username: "uniqueuser1",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueuser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueuser2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueuser2",
        email: uniqueUser1.email,
        features: ["read:activation_token"],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const uniqueEmailUser = await orchestrator.createUser({
        email: "uniqueemail1@mail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueEmailUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueemail2@mail.com",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: uniqueEmailUser.username,
        email: "uniqueemail2@mail.com",
        features: ["read:activation_token"],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const newPasswordUser = await orchestrator.createUser({
        password: "newpassword1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${newPasswordUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newpassword2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: newPasswordUser.username,
        email: newPasswordUser.email,
        features: ["read:activation_token"],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        newPasswordUser.username,
      );
      const correctPasswordMatch = await password.compare(
        "newpassword2",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "newpassword1",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
