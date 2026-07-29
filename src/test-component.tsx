import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLikedPostIds, createPost, getPublicProfile } from "./lib/social.functions";

export function TestComponent() {
  const fetchLikedIds = useServerFn(getLikedPostIds);
  const createPostFn = useServerFn(createPost);
  const getProfileFn = useServerFn(getPublicProfile);

  useQuery({
    queryKey: ["test"],
    queryFn: () => fetchLikedIds({ postIds: ["uuid"] }),
  });

  const handleClick = () => {
    createPostFn({ content: "hello", imageUrl: null });
    getProfileFn({ userId: "uuid" });
  };

  return <button onClick={handleClick}>Test</button>;
}
