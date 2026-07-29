import { getLikedPostIds, createPost, getPublicProfile } from "./src/lib/social.functions";
import { useServerFn } from "@tanstack/react-start";

const fetchLikedIds = useServerFn(getLikedPostIds);
const result = fetchLikedIds({ postIds: ["uuid"] });

const createPostFn = useServerFn(createPost);
const result2 = createPostFn({ content: "hello", imageUrl: null });

const getProfileFn = useServerFn(getPublicProfile);
const result3 = getProfileFn({ userId: "uuid" });
