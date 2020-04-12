const fs = require('fs-extra');
const path = require('path');

const {
  cookies,
  titleSelectorMap,
  defaultSelector,
  userAgent,
  maxDepth,
  concurrencyNumber,
  sleepMiliseconds,
} = require('./config');

const outputDir = 'output';
const resultsDir = 'results';
const resultsFile = 'results.json';
const results = {
  failure: {
    items: [],
    count: 0,
  },
  success: {
    items: [],
    count: 0,
  },
  skipped: {
    items: [],
    count: 0,
  },
};

/* writeResults uses the global results object and saves it to disk */
function writeResults() {
  fs.ensureDirSync(resultsDir);
  fs.writeJSONSync(path.join(resultsDir, resultsFile), results, { spaces: 2 });
}

/* addResult adds an item to res (results.failure, results.success or results.skipped) */
function addResult(res, item) {
  res.items.push(item);
  res.count += 1;
}

/* getTitle receives an url and returns the string after the last "/" */
function getTitle(url) {
  const array = url.split('/').filter(s => !!s);
  return array[array.length - 1];
}

/* getFileName returns the file name including path of the file used for a given parent + title */
function getFileName(parent, title) {
  return path.join(outputDir, parent, `${title}.mhtml`);
}

/* getSelector returns the selector to be used in a page (given its title) */
function getSelector(title) {
  return titleSelectorMap[title] || defaultSelector;
}

/* newPage returns a new page with headers and with no timeout */
async function newPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.setCookie(...cookies);
  await page.setDefaultNavigationTimeout(0);
  return page;
}

/* close closes a given page (going to about:blank is supposed to avoid memory leaks) */
async function close(page) {
  await page.goto('about:blank');
  await page.close();
}

/* savePage uses chrome devtools protocol to embed all info into an mhtml and saves it to disk */
async function savePage(page, title, parent = '') {
  fs.ensureDirSync(outputDir);
  fs.ensureDirSync(path.join(outputDir, parent));
  const cdp = await page.target().createCDPSession();
  const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
  cdp.detach();
  fs.writeFileSync(getFileName(parent, title), data);
}

/* goAndSave sleeps, goes to the url, calls savePage and manages adding and wrinting results */
async function goAndSave(page, url, title, parent, sleep) {
  await page.waitFor(sleep);
  const response = await page.goto(url);
  const { status } = response.headers();
  if (parseInt(status, 10) > 399) {
    console.log(`\n\n\nFailed request to ${url} go to with status ${status}`);
    addResult(results.failure, {
      url, title, parent, status,
    });
  } else {
    addResult(results.success, {
      url, title, parent, status,
    });
    await savePage(page, title, parent);
  }
  writeResults();
}

/*
  saveRecursively recursively follows url and selectors into child links
  - it will skip leave nodes that already exist in disk (from prior executions)
  - it will not follow links deeper than that maxDepth
  - it will try to find all selectors and call saveRecursively recursively
  - in order to reduce memory and cpu consumption, a concurrencyNumber is used
  - sleep time is increased for each concurrent request
*/
async function saveRecursively(browser, url, depth = 0, sleep = 0, parent = '') {
  const title = getTitle(url);
  if (depth === maxDepth && fs.existsSync(getFileName(parent, title))) {
    console.log(`Already saved, skipping: depth ${depth}, sleep ${sleep}, parent [${parent}], url [${url}]`);
    addResult(results.skipped, {
      url, title, parent,
    });
    return;
  }

  console.log(`Saving: depth ${depth}, sleep ${sleep}, parent [${parent}], url [${url}]`);
  const page = await newPage(browser);
  await goAndSave(page, url, title, parent, sleep);

  if (depth > maxDepth - 1) {
    await close(page);
    return;
  }

  const selector = getSelector(title);
  if (!selector) {
    await close(page);
    return;
  }

  const selectors = await page.$$(selector);
  const links = await Promise.all(selectors.map(async (s) => {
    const link = await s.$('a');
    return page.evaluate(l => l.href, link);
  }));
  await close(page);

  let lastLink = concurrencyNumber;
  const numberOfLinks = links.length;
  while (numberOfLinks + concurrencyNumber > lastLink) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(links
      // eslint-disable-next-line no-loop-func
      .filter((_, i) => i >= lastLink - concurrencyNumber && i < lastLink)
      .map(async (link, i) => saveRecursively(
        browser, link, depth + 1, i * sleepMiliseconds, path.join(parent, title),
      )));
    lastLink += concurrencyNumber;
  }
}

module.exports = {
  saveRecursively,
  results,
};
