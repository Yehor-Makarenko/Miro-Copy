import { rqClient } from "@/shared/api/instance";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardFooter, CardHeader } from "@/shared/ui/kit/card";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type RefCallback } from "react";
import { Link, useSearchParams } from "react-router";

type SORT_VALUES = "createdAt" | "updatedAt" | "lastOpenedAt" | "name";

export default function BoardList() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SORT_VALUES>(
    (searchParams.get("sort") as SORT_VALUES) || "lastOpenedAt",
  );
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(
    searchParams.get("isFavorite") === "true" ? true : undefined,
  );
  const { data, fetchNextPage, hasNextPage, isFetching } =
    rqClient.useInfiniteQuery(
      "get",
      "/boards",
      {
        params: {
          query: {
            limit: 12,
            sort,
            search,
            isFavorite,
          },
        },
      },
      {
        initialPageParam: 1,
        pageParamName: "page",
        getNextPageParam: (
          lastPage: { totalPages: number },
          _: unknown,
          lastPageParam: number,
        ) => {
          return lastPageParam < lastPage.totalPages
            ? lastPageParam + 1
            : undefined;
        },
        placeholderData: keepPreviousData,
      },
    );

  const cursorRef: RefCallback<HTMLDivElement> = useCallback(
    (el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetching) {
            fetchNextPage();
          }
        },
        {
          threshold: 0.5,
        },
      );

      if (el) {
        observer.observe(el);

        return () => {
          observer.disconnect();
        };
      }
    },
    [fetchNextPage, hasNextPage, isFetching],
  );
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
        const board = data?.pages
          .find((page) => page.list.find((board) => board.id === boardId))
          ?.list.find((board) => board.id === boardId);
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
    setSearch(newSearch);
    searchParams.set("search", newSearch);
    setSearchParams(searchParams);
  };

  const handleSortChange = (newSort: SORT_VALUES) => {
    setSort(newSort);
    searchParams.set("sort", newSort);
    setSearchParams(searchParams);
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
    <div className="container mx-auto p-4">
      <h1>Boards List</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            placeholder="Search boards..."
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleSearchChange(e.target.value)}
            value={search}
          />
          <select
            className="w-full sm:w-48 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleIsFavoriteChange(e.target.value)}
            value={isFavorite ? "favorite" : ""}
          >
            <option value="">All boards</option>
            <option value="favorite">Favorite only</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="w-full sm:w-48 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleSortChange(e.target.value as SORT_VALUES)}
            value={sort}
          >
            <option value="createdAt">Created at</option>
            <option value="updatedAt">Updated at</option>
            <option value="lastOpenedAt">Last opened at</option>
            <option value="name">Name</option>
          </select>
          <Button onClick={() => createBoardMutation.mutate({})}>
            Create board
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {data?.pages.map((page, i) => {
          return (
            <div key={i} className="grid grid-cols-3 gap-4">
              {page.list.map((board) => (
                <Card key={board.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <Button asChild variant="link">
                        <Link
                          to={typedHref(ROUTES.BOARD, { boardId: board.id })}
                        >
                          Board {board.name}
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
                        {board.isFavorite ? "Favorite" : "Not favorite"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardFooter>
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
          );
        })}
      </div>
      <div ref={cursorRef} className="h-10"></div>
    </div>
  );
}
