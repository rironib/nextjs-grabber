"use client";

import { Alert, Avatar, Button, Image, Input } from "@heroui/react";
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith("http://") || text.startsWith("https://")) {
        setUrl(text);
      } else {
        setError("Clipboard content is not a valid URL.");
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
          <form onSubmit={handleSubmit}>
            <div className="max-w-2xl w-full flex flex-col gap-4 bg-default-50 px-4 lg:px-6 py-12 rounded-xl">
              <Input
                isRequired
                isClearable
                fullWidth
                size="lg"
                onChange={(e) => setUrl(e.target.value)}
                type="text"
                variant="bordered"
                label="Website Link"
                placeholder="Enter website like"
                defaultValue={url}
              />

              <div className="grid lg:grid-cols-3 gap-4">
                <Button
                  fullWidth
                  isLoading={loading}
                  type="submit"
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
                <Button
                  fullWidth
                  onPress={handleReset}
                  color="danger"
                  size="lg"
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>

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
