import { getLikedPostIds, createPost, getPublicProfile, getFeed } from "./lib/social.functions";

type P1 = Parameters<typeof getLikedPostIds>;
type P2 = Parameters<typeof createPost>;
type P3 = Parameters<typeof getPublicProfile>;
type P4 = Parameters<typeof getFeed>;

const x1: P1 = [{ postIds: ["uuid"] }];
const x2: P2 = [{ content: "hello", imageUrl: null }];
const x3: P3 = [{ userId: "uuid" }];
const x4: P4 = [];
