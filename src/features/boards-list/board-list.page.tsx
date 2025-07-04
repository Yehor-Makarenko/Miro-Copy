import { rqClient } from "@/shared/api/instance";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardFooter, CardHeader } from "@/shared/ui/kit/card";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, type RefCallback } from "react";
import { Link } from "react-router";

export default function BoardList() {
  const queryClient = useQueryClient();
  const { data, fetchNextPage, hasNextPage, isFetching } =
    rqClient.useInfiniteQuery(
      "get",
      "/boards",
      {
        params: {
          query: {
            limit: 6,
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

  console.log(data?.pages);
  return (
    <div className="container mx-auto p-4">
      <h1>Boards List</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createBoardMutation.mutate({});
          (e.target as HTMLFormElement).reset();
        }}
      >
        <input type="text" name="name" />
        <input
          type="submit"
          value="Submit"
          disabled={createBoardMutation.isPending}
        />
      </form>
      <div className="flex flex-col gap-4">
        {data?.pages.map((page, i) => {
          return (
            <div key={i} className="grid grid-cols-3 gap-4">
              {page.list.map((board) => (
                <Card key={board.id}>
                  <CardHeader>
                    <Button asChild variant="link">
                      <Link to={typedHref(ROUTES.BOARD, { boardId: board.id })}>
                        Board {board.name}
                      </Link>
                    </Button>
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
