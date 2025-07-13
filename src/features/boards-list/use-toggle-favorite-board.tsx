import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useOptimistic } from "react";

export default function useToggleFavoriteBoard() {
  const queryClient = useQueryClient();

  const [toggledBoards, setToggledBoards] = useOptimistic<
    Record<string, boolean>
  >({});

  const toggleFavoriteMutation = rqClient.useMutation(
    "patch",
    "/boards/{boardId}/favorite",
    {
      onMutate: () => {
        queryClient.cancelQueries(rqClient.queryOptions("get", "/boards"));
      },
      onSettled: async () => {
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        );
      },
    },
  );

  return {
    toggleFavorite: (boardId: string, isFavorite: boolean) => {
      startTransition(async () => {
        setToggledBoards((toggledBoards) => ({
          ...toggledBoards,
          [boardId]: isFavorite,
        }));

        await toggleFavoriteMutation.mutateAsync({
          params: { path: { boardId } },
          body: {
            isFavorite,
          },
        });
      });
    },
    getIsPending: (boardId: string) =>
      toggleFavoriteMutation.isPending && boardId in toggledBoards,
    getOptimisticFavorite: (board: { id: string; isFavorite: boolean }) =>
      toggledBoards[board.id] ?? board.isFavorite,
  };
}
