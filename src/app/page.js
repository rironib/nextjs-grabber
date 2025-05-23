"use client";

import { useState } from "react";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Website Screenshot & Favicon Grabber
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-grow p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Screenshot</h2>
            <img
              src={result.screenshot}
              alt="Website Screenshot"
              className="rounded border w-full max-w-[100%]"
            />
          </div>
          <div>
            <h2 className="font-semibold">Favicon</h2>
            <img
              src={result.favicon}
              alt="Favicon"
              className="w-16 h-16 border rounded"
            />
          </div>
        </div>
      )}
    </main>
  );
}
