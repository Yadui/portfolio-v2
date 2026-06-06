// Admin-only blog composer — keep it out of search indexes.
export const metadata = {
  title: "Create Post",
  robots: { index: false, follow: false },
};

export default function BlogCreateLayout({ children }) {
  return children;
}
