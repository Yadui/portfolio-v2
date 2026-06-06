// Admin-only blog editor — keep it (and its dynamic [id] routes) out of indexes.
export const metadata = {
  title: "Edit Post",
  robots: { index: false, follow: false },
};

export default function BlogEditLayout({ children }) {
  return children;
}
