import { createFileRoute } from "@tanstack/react-router";
import { GuestHome } from "@/components/checkin/GuestHome";

export const Route = createFileRoute("/")({
  component: GuestHome,
  head: () => ({
    meta: [
      { title: "胡桃民宿 · 線上自助入住" },
      {
        name: "description",
        content: "歡迎入住胡桃民宿，請於抵達前完成線上自助入住流程。",
      },
    ],
  }),
});
