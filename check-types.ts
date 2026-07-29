import { getLikedPostIds, createPost, getPublicProfile } from "./src/lib/social.functions";

const result = getLikedPostIds({ postIds: ["uuid"] });
const result2 = createPost({ content: "hello", imageUrl: null });
const result3 = getPublicProfile({ userId: "uuid" });
