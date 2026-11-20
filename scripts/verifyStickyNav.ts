import puppeteer from "puppeteer-core";
import * as path from "path";
import * as fs from "fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  console.log("=== STARTING STICKY NAVIGATION VERIFICATION ===");

  const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
  });

  const page = await browser.newPage();

  const testViewports = [
    { name: "Mobile (390x844)", width: 390, height: 844, expectedNavbarHeight: 56, expectedSubnavTop: 56 },
    { name: "Tablet (768x1024)", width: 768, height: 1024, expectedNavbarHeight: 64, expectedSubnavTop: 64 },
    { name: "Desktop (1440x900)", width: 1440, height: 900, expectedNavbarHeight: 64, expectedSubnavTop: 64 },
  ];

  for (const vp of testViewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} ---`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:3000/discover#matches", { waitUntil: "networkidle0" });

    // Ensure Matches tab is active and matches grid has loaded
    await page.waitForSelector('[data-testid="matches-grid"]', { timeout: 30000 });

    // Check initial state
    const initialState = await page.evaluate(() => {
      const header = document.querySelector("header");
      const subnav = document.querySelector('[data-testid="discover-tab-btn"]')?.closest(".sticky");
      const headerRect = header?.getBoundingClientRect();
      const subnavRect = subnav?.getBoundingClientRect();
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;

      return {
        headerTop: Math.round(headerRect?.top || 0),
        headerHeight: Math.round(headerRect?.height || 0),
        subnavTop: Math.round(subnavRect?.top || 0),
        subnavHeight: Math.round(subnavRect?.height || 0),
        hasHorizontalOverflow: scrollWidth > innerWidth,
      };
    });

    console.log(`Initial Header: top=${initialState.headerTop}px, height=${initialState.headerHeight}px`);
    console.log(`Initial Subnav: top=${initialState.subnavTop}px, height=${initialState.subnavHeight}px`);
    console.log(`Horizontal Overflow: ${initialState.hasHorizontalOverflow ? "FAIL" : "PASS (0px)"}`);

    // Now scroll down by 600px
    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise((r) => setTimeout(r, 400));

    const scrolledState = await page.evaluate(() => {
      const scrollY = Math.round(window.scrollY);
      const header = document.querySelector("header");
      const subnav = document.querySelector('[data-testid="discover-tab-btn"]')?.closest(".sticky");
      const headerRect = header?.getBoundingClientRect();
      const subnavRect = subnav?.getBoundingClientRect();
      const firstCard = document.querySelector('[data-testid="matches-grid"] > div');
      const firstCardRect = firstCard?.getBoundingClientRect();

      return {
        scrollY,
        headerTop: Math.round(headerRect?.top || 0),
        headerHeight: Math.round(headerRect?.height || 0),
        subnavTop: Math.round(subnavRect?.top || 0),
        subnavHeight: Math.round(subnavRect?.height || 0),
        firstCardTop: Math.round(firstCardRect?.top || 0),
      };
    });

    console.log(`Scrolled Y: ${scrolledState.scrollY}px`);
    console.log(`Scrolled Header Top: ${scrolledState.headerTop}px (Expected: 0px)`);
    console.log(`Scrolled Subnav Top: ${scrolledState.subnavTop}px (Expected: ${vp.expectedSubnavTop}px)`);
    console.log(`First Card Top relative to viewport: ${scrolledState.firstCardTop}px (Cards scroll underneath sticky bars)`);

    if (scrolledState.headerTop !== 0) {
      throw new Error(`Navbar top is not 0px when scrolled! Got: ${scrolledState.headerTop}px`);
    }

    if (scrolledState.subnavTop !== vp.expectedSubnavTop) {
      throw new Error(`Subnav top is not ${vp.expectedSubnavTop}px when scrolled! Got: ${scrolledState.subnavTop}px`);
    }

    // Verify nav buttons are still clickable at scrolled position
    const clickableTest = await page.evaluate(() => {
      const homeLink = Array.from(document.querySelectorAll("header a")).find(el => el.textContent?.includes("Home")) as HTMLElement | null;
      const discoverBtn = document.querySelector('[data-testid="discover-tab-btn"]') as HTMLElement | null;
      const matchesBadge = Array.from(document.querySelectorAll("header a")).find(el => el.getAttribute("title") === "View Matches") as HTMLElement | null;

      return {
        homeLinkVisible: !!homeLink && (homeLink.getBoundingClientRect().top < 70),
        discoverBtnVisible: !!discoverBtn && (discoverBtn.getBoundingClientRect().top < 130),
        matchesBadgeVisible: !!matchesBadge && (matchesBadge.getBoundingClientRect().top < 70),
      };
    });

    console.log(`Navigation clickable test:`, clickableTest);

    // Capture screenshot of scrolled state
    const cleanName = vp.name.split(" ")[0].toLowerCase();
    const screenshotPath = path.join(screenshotsDir, `sticky-nav-${cleanName}-scrolled.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Test clicking Discover button while scrolled down
    await page.click('[data-testid="discover-tab-btn"]');
    await new Promise((r) => setTimeout(r, 400));

    const discoverActive = await page.evaluate(() => {
      const discoverBtn = document.querySelector('[data-testid="discover-tab-btn"]');
      return discoverBtn?.classList.contains("text-purple-700");
    });
    console.log(`Switched to Discover tab while scrolled: ${discoverActive ? "PASS" : "FAIL"}`);

    // Switch back to Matches
    await page.click('[data-testid="matches-tab-btn"]');
    await new Promise((r) => setTimeout(r, 400));
  }

  // Navigation test from scrolled Matches to Home
  console.log("\n--- Testing Navigation from Scrolled Matches to Home ---");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/discover#matches", { waitUntil: "networkidle0" });
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise((r) => setTimeout(r, 300));

  // Click Home link in sticky navbar (SPA navigation)
  await page.evaluate(() => {
    const homeLink = Array.from(document.querySelectorAll("header a")).find(el => el.textContent?.includes("Home")) as HTMLElement | null;
    homeLink?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes("Home Placeholder"), { timeout: 5000 });

  const isHomePage = await page.evaluate(() => document.body.innerText.includes("Home Placeholder"));
  console.log(`Home page loaded successfully from scrolled state: ${isHomePage ? "PASS" : "FAIL"}`);

  // Test navigating back to Discover from Home
  await page.evaluate(() => {
    const discoverLink = Array.from(document.querySelectorAll("header a")).find(el => el.textContent?.includes("Discover")) as HTMLElement | null;
    discoverLink?.click();
  });
  await page.waitForFunction(() => document.querySelector('[data-testid="discover-tab-btn"]') !== null, { timeout: 5000 });
  const backToDiscover = await page.evaluate(() => document.querySelector('[data-testid="discover-tab-btn"]') !== null);
  console.log(`Navigated back to Discover: ${backToDiscover ? "PASS" : "FAIL"}`);

  await browser.close();
  console.log("\n=== ALL STICKY NAVIGATION TESTS PASSED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
