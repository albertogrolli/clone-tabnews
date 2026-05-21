import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: '"Alberto Grolli" <contato@albertogrolli.com.br>',
      to: "albertogrolli@hotmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });
    await email.send({
      from: '"Alberto Grolli" <contato@albertogrolli.com.br>',
      to: "albertogrolli@hotmail.com",
      subject: "Último email enviado",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@albertogrolli.com.br>");
    expect(lastEmail.recipients[0]).toBe("<albertogrolli@hotmail.com>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email.\r\n");
  });
});
