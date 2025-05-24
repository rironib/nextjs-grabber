// app/api/favicon/route.js
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
      'link[rel="icon" i][href]',
      'link[rel="shortcut icon"][href]',
    ].join(", "),
    (links) => links.map((link) => link.href)
  );
  return favicons[0] || `${url}/favicon.ico`;
};

export async function POST(req) {
  const { url, domain } = await req.json();

  const publicDir = path.join(process.cwd(), "public", "images");
  const faviconPath = path.join(publicDir, `${domain}.png`);

  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    const faviconUrl = await extractFavicon(url, page);
    await browser.close();

    const res = await fetch(faviconUrl);
    const buffer = await res.buffer();

    if (faviconUrl.endsWith(".ico")) {
      await fs.writeFile(faviconPath, buffer);
    } else {
      try {
        await sharp(buffer)
          .resize(256, 256, { fit: "cover" })
          .png()
          .toFile(faviconPath);
      } catch (err) {
        await fs.writeFile(faviconPath, buffer);
      }
    }

    return NextResponse.json({ favicon: `/images/${domain}.png` });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Favicon fetch failed" },
      { status: 500 }
    );
  }
}
