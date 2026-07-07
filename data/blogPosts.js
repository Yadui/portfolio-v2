const normalizeCreatedAt = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const sortNewestFirst = (left, right) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

export const seededBlogPosts = [];

export const getSeededBlogPostBySlug = (slug) =>
  seededBlogPosts.find((post) => post.slug === slug) ?? null;

export const normalizeStoredPost = (post) => ({
  ...post,
  sourceType: "database",
  createdAt: normalizeCreatedAt(post.createdAt),
});

export const mergeBlogPosts = (storedPosts = []) => {
  const mergedPosts = new Map(seededBlogPosts.map((post) => [post.slug, post]));

  storedPosts
    .filter(Boolean)
    .map(normalizeStoredPost)
    .forEach((post) => {
      mergedPosts.set(post.slug, post);
    });

  return Array.from(mergedPosts.values()).sort(sortNewestFirst);
};