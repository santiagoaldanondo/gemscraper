/* entry point to the web to be scraped */
const mainUrl = 'https://www.example.org/';

/* cookies needed, for example if page requires authentiaction */
const cookies = [
  {
    name: 'example1',
    value: 'example1',
    domain: 'example.org',
  },
  {
    name: 'example2',
    value: 'example2',
    domain: 'example.org',
  },
];

/* map between page title and the selector to follow */
const titleSelectorMap = {
  'example-title1': '.example-parent-class1 .example-child-class1',
  'example-title2': '.example-parent-class2 .example-child-class2',
};

/* default selector used to avoid repeating the same selector many times in titleSelectorMap */
const defaultSelector = '.articles-list .article-preview__content'; // for gemology and jewelry-lapidary children

/* user agent, so no evidence of automated chromium is sent */
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36';

/* max depth to follow links */
const maxDepth = 3;

/*
  number of promises to be executed in parallel (at a given depth), taking into account
  the recursiveness, the actual number of promises will be exponential with maxDepth
*/
const concurrrencyNumber = 2;

/* ms to sleep bewteen concurrent pages to avoid too much load on the server (and 429 errors) */
const sleepMiliseconds = 300;

module.exports = {
  mainUrl,
  cookies,
  titleSelectorMap,
  defaultSelector,
  userAgent,
  maxDepth,
  concurrrencyNumber,
  sleepMiliseconds,
};

module.exports = {
  mainUrl,
  cookies,
  titleSelectorMap,
  defaultSelector,
  userAgent,
  maxDepth,
  concurrrencyNumber,
};
