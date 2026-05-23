import { createRouter } from "next-connect";
import controller from "infra/controller.js";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  return response.status(200).json({});
}
