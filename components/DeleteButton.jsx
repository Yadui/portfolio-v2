"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteButton({ id }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button 
        type="button" 
        variant="destructive" 
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="h-8 w-8 p-0 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-sm absolute top-4 right-4 z-10"
      >
        ✕
      </Button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-white/10 p-6 rounded-xl shadow-2xl max-w-sm w-full"
            >
              <h3 className="text-xl font-light text-white mb-2">Delete Post?</h3>
              <p className="text-white/60 mb-6">
                This action cannot be undone. Are you sure you want to permanently delete this blog post?
              </p>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirm(false)}
                  className="border-white/10 text-white hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Button>
                
                <form action={`/api/blog/delete?id=${id}`} method="POST">
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
