import createFetchClient from "openapi-fetch";
import { CONFIG } from "../model/config";
import createClient from "openapi-react-query";
import type { ApiPaths } from "./schema";

export const fetchClient = createFetchClient<ApiPaths>({
  baseUrl: CONFIG.API_BASE_URL,
});

export const rqClient = createClient(fetchClient);
