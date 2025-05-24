// app/api/screenshot/route.js
import { existsSync, mkdirSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import puppeteer from "puppeteer";

export async function POST(req) {
  const { url, domain, timer = 15000 } = await req.json();

  const publicDir = path.join(process.cwd(), "public", "images");
  const screenshotPath = path.join(publicDir, `${domain}.webp`);

  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await new Promise((r) => setTimeout(r, timer));

    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: "webp",
    });

    await browser.close();

    return NextResponse.json({ screenshot: `/images/${domain}.webp` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Screenshot failed" }, { status: 500 });
  }
}
