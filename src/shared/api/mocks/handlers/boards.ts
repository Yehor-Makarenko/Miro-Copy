import { HttpResponse } from "msw";
import type { ApiSchemas } from "../../schema";
import { http } from "../http";
import { verifyTokenOrThrow } from "../session";

//Later create functions for http requests. E.g. notFoundResponse(message: string) => HttpResponse

const boards: ApiSchemas["Board"][] = [
  {
    id: "Board1",
    name: "Marketing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    isFavorite: false,
  },
  {
    id: "Board2",
    name: "Sales",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    isFavorite: false,
  },
  {
    id: "Board3",
    name: "Support",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    isFavorite: false,
  },
];
export const boardsHandlers = [
  http.get("/boards", async (query) => {
    await verifyTokenOrThrow(query.request);

    const page = Number(query.query.get("page") || 1);
    const limit = Number(query.query.get("limit") || 10);
    const sort = query.query.get("sort");
    const isFavorite = query.query.get("isFavorite");
    const search = query.query.get("search");

    let filteredBoards = [...boards];

    if (search) {
      filteredBoards = filteredBoards.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (isFavorite !== null) {
      filteredBoards = filteredBoards.filter(
        (b) => b.isFavorite === Boolean(isFavorite),
      );
    }

    if (sort) {
      switch (sort) {
        case "createdAt":
          filteredBoards.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          break;
        case "updatedAt":
          filteredBoards.sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
          );
          break;
        case "lastOpenedAt":
          filteredBoards.sort(
            (a, b) =>
              new Date(a.lastOpenedAt).getTime() -
              new Date(b.lastOpenedAt).getTime(),
          );
          break;
        case "name":
          filteredBoards.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    const total = filteredBoards.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    filteredBoards = filteredBoards.slice(startIndex, startIndex + limit);

    return HttpResponse.json(
      {
        list: filteredBoards,
        total,
        totalPages,
      },
      { status: 200 },
    );
  }),
  http.post("/boards", async (query) => {
    await verifyTokenOrThrow(query.request);
    const board: ApiSchemas["Board"] = {
      id: crypto.randomUUID(),
      name: "Untitled board",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      isFavorite: false,
    };

    boards.push(board);
    return HttpResponse.json(board, { status: 201 });
  }),
  http.delete("/boards/{boardId}", async (query) => {
    await verifyTokenOrThrow(query.request);
    const { boardId } = query.params;
    const index = boards.findIndex((b) => b.id === boardId);
    if (index === -1) {
      return HttpResponse.json(
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
  http.get("/boards/{boardId}", async (query) => {
    await verifyTokenOrThrow(query.request);
    const { boardId } = query.params;
    const board = boards.find((b) => b.id === boardId);
    if (!board) {
      return HttpResponse.json(
        {
          message: "Board not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(board, {
      status: 200,
    });
  }),
  http.patch("/boards/{boardId}/favorite", async (query) => {
    await verifyTokenOrThrow(query.request);
    const { boardId } = query.params;
    const { isFavorite } = await query.request.json();
    const board = boards.find((b) => b.id === boardId);

    if (!board) {
      return HttpResponse.json(
        {
          message: "Board not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    board.isFavorite = isFavorite;

    return HttpResponse.json(board, {
      status: 200,
    });
  }),
  http.patch("/boards/{boardId}/rename", async (query) => {
    await verifyTokenOrThrow(query.request);
    const { boardId } = query.params;
    const { name } = await query.request.json();
    const board = boards.find((b) => b.id === boardId);

    if (!board) {
      return HttpResponse.json(
        {
          message: "Board not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    board.name = name;

    return HttpResponse.json(board, {
      status: 200,
    });
  }),
];
