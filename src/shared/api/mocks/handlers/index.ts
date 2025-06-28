import { HttpResponse } from "msw";
import type { ApiSchemas } from "../../schema";
import { http } from "../http";

const boards: ApiSchemas["Board"][] = [
  {
    id: "Board1",
    name: "Marketing",
  },
  {
    id: "Board2",
    name: "Product",
  },
  {
    id: "Board3",
    name: "English  ",
  },
];

export const handlers = [
  http.get("/boards", () => {
    return HttpResponse.json(boards);
  }),
  http.post("/boards", async (query) => {
    const data = await query.request.json();
    const board: ApiSchemas["Board"] = {
      id: crypto.randomUUID(),
      name: data.name,
    };

    boards.push(board);
    return HttpResponse.json(board, { status: 201 });
  }),
  http.delete("/boards/{boardId}", (query) => {
    const { boardId } = query.params;
    const index = boards.findIndex((b) => b.id === boardId);
    if (index === -1) {
      return new HttpResponse(
        {
          message: "Board not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }
    boards.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
