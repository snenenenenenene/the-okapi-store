import { useState } from "react";
import { motion } from "framer-motion";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to subscribe");
      
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-sand-100 px-6 py-10 shadow-xl">
      <div className="absolute inset-0 bg-vintage-wash/5" />
      
      <div className="relative mx-auto max-w-2xl text-center">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="font-mono text-3xl font-medium tracking-tight text-vintage-black"
        >
          Join Our Vintage Collection
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-lg text-vintage-grey"
        >
          Subscribe to get special offers, vintage releases, and behind-the-scenes updates.
        </motion.p>
        
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border-2 border-sand-300 bg-sand-50 px-5 py-3 text-vintage-black placeholder-vintage-grey/60 transition-colors duration-200 focus:border-vintage-black focus:outline-none sm:w-72"
              required
            />
            
            <motion.button
              whileHover={{ scale: 1.02, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-vintage-black px-8 py-3 font-medium text-sand-50 shadow-lg transition-colors hover:bg-vintage-black/90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </div>
        </form>

        {status === "success" && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-vintage-grey"
          >
            Thanks for subscribing! Check your email for confirmation.
          </motion.p>
        )}

        {status === "error" && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-red-500"
          >
            Oops! Something went wrong. Please try again.
          </motion.p>
        )}
      </div>
    </div>
  );
}
