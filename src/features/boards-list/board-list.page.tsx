import { rqClient } from "@/shared/api/instance";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardFooter, CardHeader } from "@/shared/ui/kit/card";
import { Input } from "@/shared/ui/kit/input";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/shared/ui/kit/select";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CardDescription } from "../../shared/ui/kit/card";
import { useBoardsList } from "./use-boards-list";
import { useBoardsFilters, type BoardsSortOptions } from "./use-boards-filters";
import { useDebouncedValue } from "@/shared/lib/react";

export default function BoardList() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const boardsFilters = useBoardsFilters();
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(
    searchParams.get("isFavorite") === "true" ? true : undefined,
  );

  const boardsQuery = useBoardsList({
    limit: 12,
    sort: boardsFilters.sort,
    search: useDebouncedValue(boardsFilters.search, 500),
    isFavorite,
  });

  const createBoardMutation = rqClient.useMutation("post", "/boards", {
    onSettled: async () =>
      await queryClient.invalidateQueries(
        rqClient.queryOptions("get", "/boards"),
      ),
  });
  const deleteBoardMutation = rqClient.useMutation(
    "delete",
    "/boards/{boardId}",
    {
      onSettled: async () =>
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        ),
    },
  );

  const toggleFavoriteMutation = rqClient.useMutation(
    "patch",
    "/boards/{boardId}/favorite",
    {
      onMutate: ({
        params: {
          path: { boardId },
        },
      }) => {
        const board = boardsQuery.boards.find((b) => b.id === boardId);
        if (board) {
          board.isFavorite = !board.isFavorite;
        }
      },
      onSettled: async () =>
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        ),
    },
  );

  const handleSearchChange = (newSearch: string) => {
    boardsFilters.setSearchWithSearchParams(newSearch);
  };

  const handleSortChange = (newSort: BoardsSortOptions) => {
    boardsFilters.setSortWithSearchParams(newSort);
  };

  const handleIsFavoriteChange = (newIsFavorite: string) => {
    if (newIsFavorite === "favorite") {
      setIsFavorite(true);
      searchParams.set("isFavorite", "true");
      setSearchParams(searchParams);
    } else {
      setIsFavorite(undefined);
      searchParams.delete("isFavorite");
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Boards List</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
          <Input
            placeholder="Search boards..."
            value={boardsFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
          <Select
            value={isFavorite ? "favorite" : "all"}
            onValueChange={(value) => handleIsFavoriteChange(value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Boards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All boards</SelectItem>
              <SelectItem value="favorite">Favorite only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={boardsFilters.sort}
            onValueChange={(value) =>
              handleSortChange(value as BoardsSortOptions)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created at</SelectItem>
              <SelectItem value="updatedAt">Updated at</SelectItem>
              <SelectItem value="lastOpenedAt">Last opened at</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => createBoardMutation.mutate({})}>
            Create board
          </Button>
        </div>
      </div>
      {boardsQuery.isPending ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardsQuery.boards.map((board) => (
              <Card key={board.id} className="rounded-2xl shadow-md">
                <CardHeader>
                  <div className="flex justify-between">
                    <Button
                      asChild
                      variant="link"
                      className="text-lg font-medium"
                    >
                      <Link to={typedHref(ROUTES.BOARD, { boardId: board.id })}>
                        {board.name}
                      </Link>
                    </Button>
                    <Button
                      variant={board.isFavorite ? "default" : "secondary"}
                      onClick={() =>
                        toggleFavoriteMutation.mutate({
                          params: { path: { boardId: board.id } },
                          body: { isFavorite: !board.isFavorite },
                        })
                      }
                    >
                      {board.isFavorite ? "★" : "☆"}
                    </Button>
                  </div>
                </CardHeader>
                <CardDescription>
                  <div className="flex flex-col gap-2 ml-10">
                    <p>
                      Created at{" "}
                      {new Date(board.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Last opened at{" "}
                      {new Date(board.lastOpenedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardDescription>
                <CardFooter className="justify-end">
                  <Button
                    variant="destructive"
                    disabled={deleteBoardMutation.isPending}
                    onClick={() =>
                      deleteBoardMutation.mutate({
                        params: {
                          path: {
                            boardId: board.id,
                          },
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {boardsQuery.boards.length === 0 && !boardsQuery.isPending && (
            <div className="text-center text-muted-foreground">
              No boards found
            </div>
          )}

          {boardsQuery.hasNextPage && (
            <div
              ref={boardsQuery.cursorRef}
              className="text-center text-muted-foreground py-8"
            >
              {boardsQuery.isFetchingNextPage && "Loading more..."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
