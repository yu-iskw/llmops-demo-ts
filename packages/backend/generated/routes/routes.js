"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const chat_controller_1 = require("./../../src/controllers/chat.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
  ChatMessage: {
    dataType: "refObject",
    properties: {
      role: {
        dataType: "union",
        subSchemas: [
          { dataType: "enum", enums: ["user"] },
          { dataType: "enum", enums: ["assistant"] },
        ],
        required: true,
      },
      content: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ChatRequest: {
    dataType: "refObject",
    properties: {
      message: { dataType: "string", required: true },
      history: {
        dataType: "array",
        array: { dataType: "refObject", ref: "ChatMessage" },
      },
      agentType: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AgentType: {
    dataType: "refObject",
    properties: {
      name: { dataType: "string", required: true },
      description: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, {
  noImplicitAdditionalProperties: "throw-on-extras",
  bodyCoercion: true,
});
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
  // ###########################################################################################################
  //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
  //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
  // ###########################################################################################################
  const argsChatController_processChatMessage = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "ChatRequest",
    },
  };
  app.post(
    "/chat",
    ...(0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController),
    ...(0, runtime_1.fetchMiddlewares)(
      chat_controller_1.ChatController.prototype.processChatMessage,
    ),
    async function ChatController_processChatMessage(request, response, next) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
      let validatedArgs = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsChatController_processChatMessage,
          request,
          response,
        });
        const controller = new chat_controller_1.ChatController();
        await templateService.apiHandler({
          methodName: "processChatMessage",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsChatController_getAgentTypes = {};
  app.get(
    "/chat/agent-types",
    ...(0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController),
    ...(0, runtime_1.fetchMiddlewares)(
      chat_controller_1.ChatController.prototype.getAgentTypes,
    ),
    async function ChatController_getAgentTypes(request, response, next) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
      let validatedArgs = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsChatController_getAgentTypes,
          request,
          response,
        });
        const controller = new chat_controller_1.ChatController();
        await templateService.apiHandler({
          methodName: "getAgentTypes",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
