import { ROUTES, typedHref } from "@/shared/model/routes";
import { Link } from "react-router";

export default function BoardList() {
  return (
    <div>
      <Link to={typedHref(ROUTES.BOARD, { boardId: "12" })}>Board</Link>
    </div>
  );
}
