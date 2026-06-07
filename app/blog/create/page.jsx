"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import Image from "next/image";

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload error");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/blog", {
      method: "POST",
      body: JSON.stringify({ 
        title, 
        content, 
        tags, 
        coverImage 
      }),
    });

    if (res.ok) {
      router.push("/blog");
    } else {
      alert("Failed to create post");
    }
    setLoading(false);
  };

  const mdeOptions = useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false,
      status: false,
      placeholder: "Write your masterpiece...",
      minHeight: "400px",
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary pt-32 px-4 md:px-12 pb-20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-light text-white mb-8">Create New Post</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 lg:col-span-2">
            {/* Title & Tags */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                <label className="text-white/60 font-medium">Title</label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-zinc-900 border-white/10 text-white h-12 text-lg"
                    placeholder="Enter post title"
                    required
                />
                </div>
                <div className="space-y-2">
                <label className="text-white/60 font-medium">Tags (comma separated)</label>
                <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-zinc-900 border-white/10 text-white h-12"
                    placeholder="tech, life, coding"
                />
                </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
                <label className="text-white/60 font-medium">Cover Image</label>
                <div className="flex flex-col gap-4">
                <div className="relative">
                    <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="bg-zinc-900 border-white/10 text-white file:bg-accent file:text-primary file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:font-bold hover:file:bg-accent/90 cursor-pointer h-14 pt-2"
                    />
                    {uploading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent text-sm font-bold animate-pulse">
                        Uploading...
                    </div>
                    )}
                </div>
                </div>
                {coverImage && (
                <div className="mt-4 relative w-full h-64 rounded-xl overflow-hidden border border-white/10 group">
                    <Image 
                    src={coverImage} 
                    alt="Cover preview" 
                    fill 
                    className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-bold"
                    >
                        Remove Image
                    </button>
                    </div>
                </div>
                )}
            </div>
            
            {/* Rich Text Editor */}
            <div className="space-y-2 prose-editor-wrapper">
                <label className="text-white/60 font-medium">Content</label>
                <div className="bg-white rounded-lg overflow-hidden text-black">
                <SimpleMDE
                    value={content}
                    onChange={setContent}
                    options={mdeOptions}
                />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button 
                type="submit" 
                disabled={loading || uploading} 
                className="bg-accent text-primary hover:bg-accent/90 h-12 px-8 text-lg font-bold w-full md:w-auto"
                >
                {loading ? "Publishing..." : "Publish Post"}
                </Button>
            </div>
            </form>

            {/* Helper Sidebar */}
            <aside className="lg:col-span-1 space-y-8 h-fit lg:sticky lg:top-32">
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-light text-white mb-4 flex items-center gap-2">
                        <span className="text-accent">ℹ️</span> Markdown Guide
                    </h3>
                    <div className="space-y-6 text-sm text-white/70">
                        {/* Callouts */}
                        <div>
                            <h4 className="font-light text-white mb-2">Colored Alerts</h4>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: "Note (Blue)", code: "> [!NOTE]\n> Your text here" },
                                    { label: "Warning (Yellow)", code: "> [!WARNING]\n> Your text here" },
                                    { label: "Error (Red)", code: "> [!DANGER]\n> Your text here" },
                                    { label: "Success (Green)", code: "> [!SUCCESS]\n> Your text here" }
                                ].map((item, i) => (
                                    <div key={i} className="group relative bg-black/40 p-2 rounded border border-white/5 hover:border-accent/40 transition-colors cursor-pointer"
                                         onClick={() => {
                                             navigator.clipboard.writeText(item.code);
                                             alert("Copied to clipboard!");
                                         }}
                                    >
                                        <div className="font-mono text-xs text-accent mb-1">{item.label}</div>
                                        <code className="block text-xs text-white/50">{item.code}</code>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] bg-accent text-black px-1 rounded font-bold">COPY</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Code Blocks */}
                        <div>
                            <h4 className="font-light text-white mb-2">Code Blocks</h4>
                             <div className="group relative bg-black/40 p-2 rounded border border-white/5 hover:border-accent/40 transition-colors cursor-pointer"
                                 onClick={() => {
                                     navigator.clipboard.writeText("```javascript\n// Your code here\nconsole.log('Hello');\n```");
                                     alert("Copied to clipboard!");
                                 }}
                            >
                                <div className="font-mono text-xs text-accent mb-1">JS Block</div>
                                <code className="block text-xs text-white/50">
                                    {"```javascript"}<br/>
                                    {"// code..."}<br/>
                                    {"```"}
                                </code>
                            </div>
                        </div>

                         {/* Links */}
                        <div>
                            <h4 className="font-light text-white mb-2">Special Links</h4>
                            <p className="text-xs mb-2">GitHub, Twitter, and LinkedIn links automatically get styled buttons.</p>
                             <div className="group relative bg-black/40 p-2 rounded border border-white/5 hover:border-accent/40 transition-colors cursor-pointer"
                                 onClick={() => {
                                     navigator.clipboard.writeText("[GitHub Profile](https://github.com/username)");
                                     alert("Copied to clipboard!");
                                 }}
                            >
                                <code className="block text-xs text-white/50">[Text](https://github.com/...)</code>
                            </div>
                        </div>

                         {/* Images */}
                        <div>
                            <h4 className="font-light text-white mb-2">Images</h4>
                            <p className="text-xs mb-2">Upload image first, then use the URL.</p>
                             <div className="group relative bg-black/40 p-2 rounded border border-white/5 hover:border-accent/40 transition-colors cursor-pointer"
                                 onClick={() => {
                                     navigator.clipboard.writeText("![Alt Text Optional](https://imagelink.com)");
                                     alert("Copied to clipboard!");
                                 }}
                            >
                                <code className="block text-xs text-white/50">![Caption](url)</code>
                            </div>
                        </div>

                    </div>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
