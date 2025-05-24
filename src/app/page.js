"use client";

import { Alert, Avatar, Button, Image, Input } from "@heroui/react";
import { useState } from "react";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    const trimmedDomain = url.trim().toLowerCase();

    if (!trimmedDomain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmedDomain)) {
      setError("Please enter a valid domain name (e.g. google.com).");
      return;
    }

    const fullUrl = `https://${trimmedDomain}`;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }), // Sending full URL
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleaned)) {
        setUrl(cleaned);
      } else {
        setError("Clipboard content is not a valid domain.");
      }
    } catch (err) {
      setError("Failed to read clipboard: " + err.message);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  return (
    <main className="max-w-3xl mx-auto">
      <div className="w-full flex items-center justify-center min-h-[90dvh]">
        <div className="w-full p-4 lg:p-8">
          <div className="max-w-2xl w-full flex flex-col gap-4 bg-default-50 px-4 lg:px-6 py-12 rounded-xl">
            <Input
              isRequired
              isClearable
              fullWidth
              size="lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="text"
              variant="bordered"
              label="Website Link"
              placeholder="Enter website link"
            />

            <div className="grid lg:grid-cols-3 gap-4">
              <Button
                fullWidth
                isLoading={loading}
                onClick={handleGenerate}
                color="primary"
                size="lg"
              >
                Generate
              </Button>
              <Button
                fullWidth
                onPress={handlePaste}
                color="secondary"
                size="lg"
              >
                Paste
              </Button>
              <Button fullWidth onPress={handleReset} color="danger" size="lg">
                Reset
              </Button>
            </div>
          </div>

          {error && (
            <div className="max-w-2xl w-full flex items-center justify-center py-6">
              <Alert color="warning" description={error} />
            </div>
          )}

          {result && (
            <div className="max-w-2xl w-full flex flex-col gap-3 lg:gap-6 items-center px-4 py-6 mt-6 rounded-xl bg-default-50">
              <Avatar
                isBordered
                size="lg"
                src={result.favicon}
                name="Favicon"
              />
              <Image
                alt="Screenshot"
                src={result.screenshot}
                className="border-2 border-default-100 w-full h-auto bg-default-50 max-w-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
