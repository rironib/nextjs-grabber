"use client";

import {
  Alert,
  Avatar,
  Button,
  Image,
  Input,
  NumberInput,
  Progress,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [timer, setTimer] = useState(15); // default 15 seconds
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current); // cleanup on unmount
  }, []);

  const handleGenerate = async () => {
    let domain = "";
    try {
      const input = url.trim();
      const normalized = input.startsWith("http") ? input : `https://${input}`;
      const parsed = new URL(normalized);
      domain = parsed.hostname.replace(/^www\./, "").toLowerCase();
    } catch (e) {
      setError("Please enter a valid URL or domain.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const duration = Number(timer) || 15;
    const updateInterval = 100;
    const increment = 100 / ((duration * 1000) / updateInterval);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          return 100;
        }
        return next;
      });
    }, updateInterval);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, timer: duration }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      clearInterval(intervalRef.current);
      setProgress(100);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch (err) {
      setError("Failed to read clipboard: " + err.message);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
    setProgress(0);
    setLoading(false);
    clearInterval(intervalRef.current);
  };

  return (
    <main className="mx-auto max-w-3xl">
      <div className="flex min-h-[90dvh] w-full items-center justify-center">
        <div className="w-full p-4 lg:p-8">
          {error && (
            <div className="flex w-full max-w-2xl items-center justify-center pb-3 lg:pb-6">
              <Alert color="warning" description={error} />
            </div>
          )}

          <div className="flex w-full max-w-2xl flex-col gap-4 rounded-xl bg-default-50 px-4 py-12 lg:px-6">
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
              placeholder="e.g. themoviedb.org or https://www.example.com/page"
            />
            <NumberInput
              isRequired
              isClearable
              fullWidth
              size="lg"
              value={timer}
              onChange={(val) => setTimer(val)}
              variant="bordered"
              label="Timeout (seconds)"
              placeholder="Enter timeout in seconds"
            />
            <div className="grid gap-4 lg:grid-cols-3">
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
            {loading && (
              <Progress
                value={progress}
                color="primary"
                aria-label="Loading..."
              />
            )}
          </div>

          {result && (
            <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-3 rounded-xl bg-default-50 px-4 py-6 lg:gap-6">
              <Avatar
                isBordered
                size="lg"
                src={result.favicon}
                name="Favicon"
              />
              <Image
                alt="Screenshot"
                src={result.screenshot}
                className="h-auto w-full max-w-2xl border-2 border-default-100 bg-default-50"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
