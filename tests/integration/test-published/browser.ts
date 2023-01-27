import puppeteer from 'puppeteer';
import * as path from 'path';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = `file://${ path.join(__dirname, 'browser.html') }`;
  await page.goto(url);
  await page.setViewport({width: 1080, height: 1024});

  const result_el = await page.waitForSelector('#result');
  const id = await result_el?.evaluate(el => el.textContent);
  if (!id || id.length !== 8) {
    throw new Error('Missing id');
  }
  const version_el = await page.waitForSelector('#version');
  const version = await version_el?.evaluate(el => el.textContent);
  if (!version) {
    throw new Error('Missing version');
  }
  console.log(version, 'browser', id);

  await browser.close();
})();
