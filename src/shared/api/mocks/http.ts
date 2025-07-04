import { createOpenApiHttp } from "openapi-msw";
import type { ApiPaths } from "../schema";
import { CONFIG } from "@/shared/model/config";

export const http = createOpenApiHttp<ApiPaths>({
  baseUrl: CONFIG.API_BASE_URL,
});
