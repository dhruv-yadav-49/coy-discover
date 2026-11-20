import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:3000";

interface ViewportSpec {
  name: string;
  width: number;
  height: number;
  isMobile: boolean;
  expectedGridCols?: number;
}

const VIEWPORTS: ViewportSpec[] = [
  { name: "Mobile (320px)", width: 320, height: 568, isMobile: true, expectedGridCols: 1 },
  { name: "Mobile (375px)", width: 375, height: 667, isMobile: true, expectedGridCols: 1 },
  { name: "Mobile (390px)", width: 390, height: 844, isMobile: true, expectedGridCols: 1 },
  { name: "Mobile (430px)", width: 430, height: 932, isMobile: true, expectedGridCols: 1 },
  { name: "Tablet (768px)", width: 768, height: 1024, isMobile: true, expectedGridCols: 2 },
  { name: "Desktop (1024px)", width: 1024, height: 768, isMobile: false, expectedGridCols: 3 },
  { name: "Desktop (1440px)", width: 1440, height: 900, isMobile: false, expectedGridCols: 3 },
];

export interface ViewportAuditResult {
  viewport: string;
  width: number;
  height: number;
  hasHorizontalScroll: boolean;
  navbarOverflow: boolean;
  cardOverflow: boolean;
  buttonsTouchFriendly: boolean;
  passStatus: boolean;
  details: string;
}

async function runResponsiveAudit() {
  console.log("🚀 Starting Coy Discover Comprehensive Responsive UI Audit...\n");

  const screenshotsDir = path.resolve("./public/screenshots/responsive");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Reset demo state via API
  console.log("🔄 Resetting demo database state...");
  await fetch(`${BASE_URL}/api/reset`, { method: "POST" });

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  const results: ViewportAuditResult[] = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n======================================================`);
    console.log(`📱 Testing Viewport: ${vp.name} [${vp.width}x${vp.height}]`);
    console.log(`======================================================`);

    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });

    // 1. Test Home Placeholder
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 600));

    const homeScrollCheck = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        hasOverflow: doc.scrollWidth > doc.clientWidth,
      };
    });

    if (vp.width === 320) {
      await page.screenshot({ path: path.join(screenshotsDir, "home-320px.png") });
    }

    // 2. Test Discover Feed
    await page.goto(`${BASE_URL}/discover`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    const discoverMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const header = document.querySelector("header");
      const card = document.querySelector("div.cursor-grab");
      const passBtn = document.querySelector("button[data-testid='pass-button']");
      const likeBtn = document.querySelector("button[data-testid='like-button']");

      const headerRect = header?.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();
      const passRect = passBtn?.getBoundingClientRect();
      const likeRect = likeBtn?.getBoundingClientRect();

      const hasDocOverflow = doc.scrollWidth > doc.clientWidth;
      const navbarOverflow = header ? header.scrollWidth > doc.clientWidth + 1 : false;
      const cardOverflow = cardRect ? cardRect.width > doc.clientWidth : false;

      const buttonsTouchFriendly =
        (passRect ? passRect.width >= 48 && passRect.height >= 48 : false) &&
        (likeRect ? likeRect.width >= 48 && likeRect.height >= 48 : false);

      return {
        hasDocOverflow,
        navbarOverflow,
        cardOverflow,
        cardWidth: cardRect?.width || 0,
        cardHeight: cardRect?.height || 0,
        buttonsTouchFriendly,
        passBtnSize: passRect ? `${Math.round(passRect.width)}x${Math.round(passRect.height)}` : "missing",
        likeBtnSize: likeRect ? `${Math.round(likeRect.width)}x${Math.round(likeRect.height)}` : "missing",
      };
    });

    // Screenshot discover feed
    const slug = vp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await page.screenshot({ path: path.join(screenshotsDir, `discover-${slug}.png`) });

    const isPass =
      !discoverMetrics.hasDocOverflow &&
      !discoverMetrics.navbarOverflow &&
      !discoverMetrics.cardOverflow &&
      discoverMetrics.buttonsTouchFriendly;

    results.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      hasHorizontalScroll: discoverMetrics.hasDocOverflow,
      navbarOverflow: discoverMetrics.navbarOverflow,
      cardOverflow: discoverMetrics.cardOverflow,
      buttonsTouchFriendly: discoverMetrics.buttonsTouchFriendly,
      passStatus: isPass,
      details: `Card: ${Math.round(discoverMetrics.cardWidth)}x${Math.round(discoverMetrics.cardHeight)}px, PassBtn: ${discoverMetrics.passBtnSize}, LikeBtn: ${discoverMetrics.likeBtnSize}`,
    });

    console.log(`   - Horizontal Scroll: ${discoverMetrics.hasDocOverflow ? "❌ DETECTED" : "✅ None"}`);
    console.log(`   - Navbar Overflow: ${discoverMetrics.navbarOverflow ? "❌ OVERFLOW" : "✅ Fits Perfectly"}`);
    console.log(`   - Card Sizing: ${Math.round(discoverMetrics.cardWidth)}px width (Fits: ${!discoverMetrics.cardOverflow ? "✅" : "❌"})`);
    console.log(`   - Touch Target Sizes: ${discoverMetrics.buttonsTouchFriendly ? "✅ >=48px Touch Friendly" : "❌ Too Small"}`);
  }

  // -------------------------------------------------------------
  // Test 3: Swipe Gestures & Match Modal Responsiveness
  // -------------------------------------------------------------
  console.log("\n======================================================");
  console.log("💘 Testing Touch Gestures & Match Modal on Mobile (390px)");
  console.log("======================================================");

  // Reset database state so Aarav Sharma (likedCurrentUser: true) is on top of feed
  await fetch(`${BASE_URL}/api/reset`, { method: "POST" });

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/discover`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  // Click Like button on Aarav Sharma
  console.log("❤️ Clicking Like Button to trigger Mutual Match on Aarav Sharma...");
  await page.evaluate(() => {
    const likeBtn = document.querySelector("button[data-testid='like-button']") as HTMLButtonElement;
    likeBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Check Match Modal on 390px
  const modal390Metrics = await page.evaluate(() => {
    const modal = document.querySelector("div.fixed.inset-0");
    const modalBox = modal?.querySelector("div.relative.z-10");
    if (!modalBox) return null;

    const rect = modalBox.getBoundingClientRect();
    const doc = document.documentElement;
    const hasHorizontalOverflow = doc.scrollWidth > doc.clientWidth;
    const fitsViewportHeight = rect.height <= window.innerHeight;

    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      hasHorizontalOverflow,
      fitsViewportHeight,
    };
  });

  console.log("🎉 Match Modal Metrics (390px):", modal390Metrics);
  await page.screenshot({ path: path.join(screenshotsDir, "match-modal-390px.png") });

  // Test Match Modal on 320px
  await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, "match-modal-320px.png") });

  const modal320Metrics = await page.evaluate(() => {
    const modal = document.querySelector("div.fixed.inset-0");
    const modalBox = modal?.querySelector("div.relative.z-10");
    if (!modalBox) return null;
    const rect = modalBox.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth,
      fitsViewportHeight: rect.height <= window.innerHeight,
    };
  });
  console.log("🎉 Match Modal Metrics (320px):", modal320Metrics);

  // -------------------------------------------------------------
  // Test 4: Matches View Responsiveness across Breakpoints
  // -------------------------------------------------------------
  console.log("\n======================================================");
  console.log("📋 Testing Matches Grid Responsiveness across Breakpoints");
  console.log("======================================================");

  // Transition to Matches view
  await page.goto(`${BASE_URL}/discover#matches`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  await page.evaluate(() => {
    const matchTab = document.querySelector("button[data-testid='matches-tab-btn']") as HTMLButtonElement;
    if (matchTab) matchTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const getGridCols = async () => {
    return await page.evaluate(() => {
      const grid = document.querySelector("div[data-testid='matches-grid']");
      if (!grid) return 0;
      const style = window.getComputedStyle(grid);
      return style.gridTemplateColumns.split(" ").filter(Boolean).length;
    });
  };

  // Test Matches on Mobile (320px): Expect 1 column
  await page.setViewport({ width: 320, height: 568, isMobile: true });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, "matches-320px.png") });
  const matches320Cols = await getGridCols();
  console.log(`Matches 320px Grid Columns: ${matches320Cols} (Expected: 1)`);

  // Test Matches on Tablet (768px): Expect 2 columns
  await page.setViewport({ width: 768, height: 1024, isMobile: true });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, "matches-768px.png") });
  const matches768Cols = await getGridCols();
  console.log(`Matches 768px Grid Columns: ${matches768Cols} (Expected: 2)`);

  // Test Matches on Desktop (1440px): Expect 3 columns
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, "matches-1440px.png") });
  const matches1440Cols = await getGridCols();
  console.log(`Matches 1440px Grid Columns: ${matches1440Cols} (Expected: 3)`);

  // -------------------------------------------------------------
  // Test 5: Refresh Persistence Check
  // -------------------------------------------------------------
  console.log("\n======================================================");
  console.log("🔄 Testing Refresh Persistence after Swipes & Matches");
  console.log("======================================================");
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));

  // Switch to matches tab
  await page.evaluate(() => {
    const matchTab = document.querySelector("button[data-testid='matches-tab-btn']") as HTMLButtonElement;
    matchTab?.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const persistedMatchesCount = await page.evaluate(() => {
    return document.querySelectorAll("div.group").length;
  });
  console.log(`Persisted Matches Count after reload: ${persistedMatchesCount} (Expected >= 1)`);

  // Switch back to discover tab and verify Aarav Sharma never reappears
  await page.evaluate(() => {
    const discoverTab = document.querySelector("button[data-testid='discover-tab-btn']") as HTMLButtonElement;
    discoverTab?.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const topCardName = await page.evaluate(() => {
    const card = document.querySelector("div.cursor-grab");
    return card?.querySelector("h2")?.textContent?.trim();
  });
  console.log(`Top profile after refresh: "${topCardName}" (Expected: not Aarav Sharma)`);

  await browser.close();
  console.log("\n🏁 Responsive UI Verification Complete.");

  return results;
}

runResponsiveAudit().then((res) => {
  console.log("\n========================================================");
  console.log("📊 FINAL RESPONSIVE VIEWPORT AUDIT REPORT");
  console.log("========================================================");
  console.table(res);
});
