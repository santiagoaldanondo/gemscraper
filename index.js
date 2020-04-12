const puppeteer = require('puppeteer');

const {
  saveRecursively,
  results,
} = require('./utils');
const { mainUrl } = require('./config');

async function main() {
  console.time('main');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.close();
  try {
    await saveRecursively(browser, mainUrl);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
    console.log(`\n\nFinished scraping, success ${results.success.count}, failure ${results.failure.count}, skipped (already existed) ${results.skipped.count} time spent: `);
    console.timeEnd('main');
  }
}

main();
