import { getFeed, getPublicProfile, toggleLike, createPost } from "./src/lib/social.functions";
import { useServerFn } from "@tanstack/react-start";

const fetchFeed = useServerFn(getFeed);
type FeedParams = Parameters<typeof fetchFeed>;
const x: FeedParams = [{} as any];

const fetchProfile = useServerFn(getPublicProfile);
type ProfileParams = Parameters<typeof fetchProfile>;

const like = useServerFn(toggleLike);
type LikeParams = Parameters<typeof like>;

const post = useServerFn(createPost);
type PostParams = Parameters<typeof post>;
