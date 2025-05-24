import { existsSync, mkdirSync } from "fs"; // FS methods for checking/creating directories
import fs from "fs/promises"; // Promise-based FS API
import { NextResponse } from "next/server"; // Next.js API response helper
import fetch from "node-fetch"; // Used to fetch favicon from external URLs
import path from "path"; // Node.js path utilities
import puppeteer from "puppeteer"; // Headless browser for screenshot and favicon scraping
import sharp from "sharp"; // Image processing library

// Extract the first available favicon URL from the page
const extractFavicon = async (url, page) => {
  const favicons = await page.$$eval(
    [
      'link[rel="apple-touch-icon"][href]',
      'link[rel="apple-touch-icon-precomposed"][href]',
      'link[rel="icon" i][href]',
      'link[rel="favicon"][href]',
      'link[rel="fluid-icon"][href]',
      'link[rel="shortcut icon"][href]',
      'link[rel="Shortcut Icon"][href]',
      'link[rel="mask-icon"][href]',
    ].join(", "),
    (links) => links.map((link) => link.href)
  );
  return favicons[0] || `${url}/favicon.ico`; // Fallback if no icon tag found
};

export async function POST(req) {
  try {
    const body = await req.json(); // Parse JSON body
    const { domain, timer } = body;

    // Validate input
    if (!domain) {
      return NextResponse.json({ error: "Domain is missing" }, { status: 400 });
    } else if (!timer) {
      return NextResponse.json(
        { error: "Timeout is missing" },
        { status: 400 }
      );
    }

    const fullUrl = `https://${domain.trim().toLowerCase()}`; // Normalize domain
    const timeoutMs = timer * 1000; // Convert to milliseconds

    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(publicDir, "images");

    // Ensure images directory exists
    if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });

    // Define output file paths
    const screenshotPath = path.join(imagesDir, `${domain}.webp`);
    const faviconPath = path.join(imagesDir, `${domain}.png`);

    // Launch headless browser
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Set viewport and user-agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    );

    // Navigate to target URL
    try {
      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: timeoutMs,
      });
    } catch (err) {
      await browser.close();
      return NextResponse.json(
        { error: "Failed to navigate to the URL." },
        { status: 500 }
      );
    }

    // Wait for additional content load if needed
    await new Promise((resolve) => setTimeout(resolve, timeoutMs));

    // Capture screenshot as WebP
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: "webp",
    });

    // Extract favicon URL
    const faviconUrl = await extractFavicon(fullUrl, page);

    try {
      const response = await fetch(faviconUrl);
      if (!response.ok) throw new Error("Favicon fetch failed");

      const buffer = await response.buffer();

      if (faviconUrl.endsWith(".ico")) {
        // Save .ico file directly
        await fs.writeFile(faviconPath, buffer);
      } else {
        try {
          // Resize and convert image to PNG
          await sharp(buffer)
            .resize(256, 256, { fit: "cover" })
            .png()
            .toFile(faviconPath);
        } catch (err) {
          console.error("Sharp failed to resize PNG:", err.message);
          await fs.writeFile(faviconPath, buffer); // Fallback write
        }
      }
    } catch (faviconErr) {
      console.error("Favicon fetch/conversion error:", faviconErr.message);
    }

    await browser.close(); // Cleanup browser

    // Success response with paths
    return NextResponse.json({
      message: "Screenshot and favicon saved successfully",
      screenshot: `/images/${domain}.webp`,
      favicon: `/images/${domain}.png`,
    });
  } catch (error) {
    console.error("Processing failed:", error);
    return NextResponse.json(
      { error: "Failed to capture screenshot" },
      { status: 500 }
    );
  }
}
