# Gemscraper

## Overview

- This script is used to scrape a website using puppeteer, following links as deep as configured.
- Each page is saved as `mhtml`, including all info (images, css, js) so it can be used offline. This files are saved to an output folder, keeping the same hierarchy as in the scraped website.
- An example configuration file is provided. This should be modified and saved to config.js with the wanted values for your needs. The variables `maxDepth`, `concurrencyNumber` and `sleepMiliseconds` will have an impact in CPU and RAM used and the speed of requests sent to the server (and correspondently its load). 
- A JSON file is saved to results directory, with a summary of the success and failure pages.

## TODO

- Check `puppeteer` `page.close()` as it seems that it is neither closing the corresponding browser tabs nor releasing memory.
- Tune `maxDepth`, `concurrencyNumber` and `sleepMiliseconds` to reduce the time spent during scraping. With the current configuration, it has taken 1 hour to save more than 2000 pages (around 5gb total)