import puppeteer from "puppeteer-core";
import os from "os";
import path from "path";
import fs from "fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  console.log("=== STARTING FULL END-TO-END LIKE/MATCH AUDIT ===");

  // 1. Reset demo user history first
  console.log("Resetting demo user state via /api/reset...");
  const resetRes = await fetch("http://localhost:3000/api/reset", { method: "POST" });
  const resetData = await resetRes.json();
  console.log("Reset result:", resetData);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "puppeteer_e2e_"));
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    userDataDir: tempDir,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
  });

  const page = await browser.newPage();

  // Forward console logs from page
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.startsWith("[SWIPE_")) {
      console.log(`[BROWSER CONSOLE] ${text}`);
    }
  });

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/discover", { waitUntil: "networkidle0" });

  // Helper to get active profile name
  async function getActiveCardName() {
    return page.evaluate(() => {
      const el = document.querySelector('[data-testid="active-profile-name"]');
      return el ? el.textContent?.trim() : null;
    });
  }

  // Helper to check if Match Modal is visible
  async function isMatchModalVisible() {
    const modal = await page.waitForSelector('[data-testid="match-modal"]', { timeout: 3000 }).catch(() => null);
    if (!modal) return false;
    return page.evaluate(() => {
      const modalEl = document.querySelector('[data-testid="match-modal"]');
      if (!modalEl) return false;
      const heading = modalEl.querySelector("h2")?.textContent || "";
      return heading.toUpperCase().includes("MATCH");
    });
  }

  // Helper to close Match Modal
  async function closeMatchModal() {
    const keepBrowsingBtn = await page.waitForSelector('[data-testid="modal-keep-browsing-btn"]', { timeout: 4000 }).catch(() => null);
    if (keepBrowsingBtn) {
      await keepBrowsingBtn.click();
      await page.waitForFunction(() => document.querySelector('[data-testid="match-modal"]') === null, { timeout: 4000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // TEST 1: Profile 1 (Aarav Sharma - likedCurrentUser: true)
  // Expected: Like via Click -> Match Modal appears!
  console.log("\n--- TEST 1: Aarav Sharma (Mutual Like) via Button Click ---");
  let activeName = await getActiveCardName();
  console.log(`Active Profile 1: "${activeName}" (Expected: Aarav Sharma)`);
  if (activeName !== "Aarav Sharma") throw new Error(`Expected Aarav Sharma, got ${activeName}`);

  await page.click('[data-testid="like-button"]');
  await new Promise((r) => setTimeout(r, 600));

  let matched = await isMatchModalVisible();
  console.log(`Match Modal appeared for Aarav Sharma: ${matched ? "PASS" : "FAIL"}`);
  if (!matched) throw new Error("Match Modal did not appear for Aarav Sharma!");
  await closeMatchModal();

  // TEST 2: Profile 2 (Priya Nair - likedCurrentUser: true)
  // Expected: Like via Keyboard Right Arrow -> Match Modal appears! (Consecutive Match!)
  console.log("\n--- TEST 2: Priya Nair (Mutual Like) via Keyboard ArrowRight ---");
  await new Promise((r) => setTimeout(r, 500));
  activeName = await getActiveCardName();
  console.log(`Active Profile 2: "${activeName}" (Expected: Priya Nair)`);
  if (activeName !== "Priya Nair") throw new Error(`Expected Priya Nair, got ${activeName}`);

  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 600));

  matched = await isMatchModalVisible();
  console.log(`Match Modal appeared for Priya Nair (Consecutive Match #2): ${matched ? "PASS" : "FAIL"}`);
  if (!matched) throw new Error("Match Modal did not appear for Priya Nair!");
  await closeMatchModal();

  // TEST 3: Profile 3 (Ananya Iyer - likedCurrentUser: true)
  // Expected: Like via Button Click -> Match Modal appears! (Consecutive Match #3!)
  console.log("\n--- TEST 3: Ananya Iyer (Mutual Like) via Button Click ---");
  await new Promise((r) => setTimeout(r, 500));
  activeName = await getActiveCardName();
  console.log(`Active Profile 3: "${activeName}" (Expected: Ananya Iyer)`);
  if (activeName !== "Ananya Iyer") throw new Error(`Expected Ananya Iyer, got ${activeName}`);

  await page.click('[data-testid="like-button"]');
  await new Promise((r) => setTimeout(r, 600));

  matched = await isMatchModalVisible();
  console.log(`Match Modal appeared for Ananya Iyer (Consecutive Match #3): ${matched ? "PASS" : "FAIL"}`);
  if (!matched) throw new Error("Match Modal did not appear for Ananya Iyer!");
  await closeMatchModal();

  // TEST 4: Profile 4 (Rohan Verma - likedCurrentUser: false)
  // Expected: Like via Button Click -> NO Match Modal! Clean advance!
  console.log("\n--- TEST 4: Rohan Verma (Non-Mutual) via Button Click ---");
  await new Promise((r) => setTimeout(r, 500));
  activeName = await getActiveCardName();
  console.log(`Active Profile 4: "${activeName}" (Expected: Rohan Verma)`);
  if (activeName !== "Rohan Verma") throw new Error(`Expected Rohan Verma, got ${activeName}`);

  await page.click('[data-testid="like-button"]');
  await new Promise((r) => setTimeout(r, 600));

  matched = await isMatchModalVisible();
  console.log(`Match Modal did NOT appear for Rohan Verma: ${!matched ? "PASS" : "FAIL"}`);
  if (matched) throw new Error("Match Modal should NOT have appeared for non-mutual Rohan Verma!");

  // TEST 5: Profile 5 (Kabir Mehta - likedCurrentUser: false)
  // Expected: Like via Keyboard -> NO Match Modal! (Consecutive non-match!)
  console.log("\n--- TEST 5: Kabir Mehta (Non-Mutual) via Keyboard ArrowRight ---");
  activeName = await getActiveCardName();
  console.log(`Active Profile 5: "${activeName}" (Expected: Kabir Mehta)`);
  if (activeName !== "Kabir Mehta") throw new Error(`Expected Kabir Mehta, got ${activeName}`);

  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 600));

  matched = await isMatchModalVisible();
  console.log(`Match Modal did NOT appear for Kabir Mehta: ${!matched ? "PASS" : "FAIL"}`);
  if (matched) throw new Error("Match Modal should NOT have appeared for non-mutual Kabir Mehta!");

  // TEST 6: Profile 6 (Vikram Malhotra - likedCurrentUser: false)
  // Expected: Pass via Pass Button -> No Match Modal, card advances
  console.log("\n--- TEST 6: Vikram Malhotra (Non-Mutual) via Pass Button ---");
  activeName = await getActiveCardName();
  console.log(`Active Profile 6: "${activeName}" (Expected: Vikram Malhotra)`);
  if (activeName !== "Vikram Malhotra") throw new Error(`Expected Vikram Malhotra, got ${activeName}`);

  await page.click('[data-testid="pass-button"]');
  await new Promise((r) => setTimeout(r, 600));

  // TEST 7: Profile 7 (Diya Patel - likedCurrentUser: true)
  // Rapid Multi-Click Concurrency Test: Rapidly tap Like 4 times
  console.log("\n--- TEST 7: Diya Patel (Mutual Like) Rapid Multi-Click Concurrency Test ---");
  activeName = await getActiveCardName();
  console.log(`Active Profile 7: "${activeName}" (Expected: Diya Patel)`);
  if (activeName !== "Diya Patel") throw new Error(`Expected Diya Patel, got ${activeName}`);

  // Rapidly fire 3 click events
  await Promise.all([
    page.click('[data-testid="like-button"]').catch(() => {}),
    page.click('[data-testid="like-button"]').catch(() => {}),
    page.click('[data-testid="like-button"]').catch(() => {}),
  ]);
  await new Promise((r) => setTimeout(r, 700));

  matched = await isMatchModalVisible();
  console.log(`Match Modal appeared for Diya Patel under rapid clicks: ${matched ? "PASS" : "FAIL"}`);
  if (!matched) throw new Error("Match Modal did not appear for Diya Patel!");
  await closeMatchModal();

  // TEST 8: Verify Matches tab and count
  console.log("\n--- TEST 8: Verify Matches Tab & Counter ---");
  const matchesCount = await page.evaluate(() => {
    const badge = Array.from(document.querySelectorAll("header a")).find((el) =>
      el.getAttribute("title")?.includes("Matches")
    );
    const countSpan = badge?.querySelector("span:last-child");
    return countSpan ? parseInt(countSpan.textContent || "0", 10) : 0;
  });
  console.log(`Matches counter badge count: ${matchesCount} (Expected: 4)`);
  if (matchesCount !== 4) throw new Error(`Expected 4 matches, got ${matchesCount}`);

  // Navigate to Matches view
  await page.click('[data-testid="matches-tab-btn"]');
  await page.waitForSelector('[data-testid="matches-grid"]', { timeout: 5000 });

  const matchedNames = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('[data-testid="matches-grid"] h3'));
    return titles.map((t) => t.textContent?.trim());
  });
  console.log("Matched Profiles in Matches Grid:", matchedNames);
  expect(matchedNames).toEqual(["Diya Patel", "Ananya Iyer", "Priya Nair", "Aarav Sharma"]);

  // TEST 9: Refresh Persistence
  console.log("\n--- TEST 9: Refresh Persistence Check ---");
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector('[data-testid="matches-grid"]', { timeout: 5000 });

  const persistedMatchesCount = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('[data-testid="matches-grid"] h3'));
    return titles.length;
  });
  console.log(`Persisted matches after refresh: ${persistedMatchesCount} (Expected: 4)`);
  if (persistedMatchesCount !== 4) throw new Error(`Expected 4 persisted matches, got ${persistedMatchesCount}`);

  // Switch back to Discover tab and check top profile
  await page.click('[data-testid="discover-tab-btn"]');
  await new Promise((r) => setTimeout(r, 500));
  const topFeedProfileAfterRefresh = await getActiveCardName();
  console.log(`Next profile in feed after refresh: "${topFeedProfileAfterRefresh}" (Expected: Meera Sen)`);
  if (topFeedProfileAfterRefresh !== "Meera Sen") {
    throw new Error(`Expected Meera Sen, got ${topFeedProfileAfterRefresh}`);
  }

  await browser.close();
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}
  console.log("\n=== ALL LIKE/MATCH END-TO-END AUDIT TESTS PASSED SUCCESSFULLY! ===");
}

function expect(actual: any) {
  return {
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Assertion failed! Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
      }
    },
  };
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
