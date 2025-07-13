import { rqClient } from "@/shared/api/instance";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export default function useCreateBoard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createBoardMutation = rqClient.useMutation("post", "/boards", {
    onSettled: async () =>
      await queryClient.invalidateQueries(
        rqClient.queryOptions("get", "/boards"),
      ),

    onSuccess: (data) =>
      navigate(typedHref(ROUTES.BOARD, { boardId: data.id })),
  });

  return {
    createBoard: () => createBoardMutation.mutate({}),
    isPending: createBoardMutation.isPending,
  };
}
