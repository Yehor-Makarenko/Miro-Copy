import type { PathParams, ROUTES } from "@/shared/model/routes";
import { useParams } from "react-router";

export default function BoardPage() {
  const params = useParams<PathParams[typeof ROUTES.BOARD]>();
  return <div>BoardPage {params.boardId}</div>;
}
