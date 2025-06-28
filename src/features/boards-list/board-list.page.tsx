import { rqClient } from "@/shared/api/instance";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardFooter, CardHeader } from "@/shared/ui/kit/card";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

export default function BoardList() {
  const queryClient = useQueryClient();
  const boardsQuery = rqClient.useQuery("get", "/boards");

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
  return (
    <div className="container mx-auto p-4">
      <h1>Boards List</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          createBoardMutation.mutate({
            body: {
              name: formData.get("name") as string,
            },
          });
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
      <div className="grid grid-cols-3 gap-4">
        {boardsQuery.data?.map((board) => {
          return (
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
          );
        })}
      </div>
    </div>
  );
}
