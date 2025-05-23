import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import path from "path";
import puppeteer from "puppeteer";
import sharp from "sharp";

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
  return favicons[0] || `${url}/favicon.ico`;
};

export async function POST(req) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  let domain;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const publicDir = path.join(process.cwd(), "public");
  const imagesDir = path.join(publicDir, "images");

  if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });

  const screenshotPath = path.join(imagesDir, `${domain}.webp`);
  const faviconPath = path.join(imagesDir, `${domain}.png`);

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    );

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    } catch (err) {
      await browser.close();
      return NextResponse.json(
        { error: "Failed to navigate to the URL." },
        { status: 500 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 15000));

    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: "webp",
    });

    const faviconUrl = await extractFavicon(url, page);

    try {
      const response = await fetch(faviconUrl);
      if (!response.ok) throw new Error("Favicon fetch failed");

      const buffer = await response.buffer();

      if (faviconUrl.endsWith(".ico")) {
        await fs.writeFile(faviconPath, buffer);
      } else {
        try {
          await sharp(buffer)
            .resize(256, 256, { fit: "cover" })
            .png()
            .toFile(faviconPath);
        } catch (err) {
          console.error("Sharp failed to resize PNG:", err.message);
          await fs.writeFile(faviconPath, buffer); // fallback
        }
      }
    } catch (faviconErr) {
      console.error("Favicon fetch/conversion error:", faviconErr.message);
    }

    await browser.close();

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
