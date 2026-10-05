import JSRandomnessPredictor from "js-randomness-predictor";
import { chromium, firefox as spidermonkey, webkit } from "playwright";

(async () => {
  const start = performance.now();

  const chromeResult = await testChrome(4, 10);
  const firefoxResult = await testFirefox(4, 10);
  const safariResult = await testSafari(6, 10);

  const end = performance.now();
  const duration = end - start;

  console.log([chromeResult, firefoxResult, safariResult]);
  console.log(`Playwright execution took ${duration.toFixed(4)} ms`);
})();

async function getRandsFromPage(page, numRands) {
  const rands = await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
  return rands;
}

async function testChrome(sequenceLength, numberOfPredictions) {
  const chrome = await chromium.launch({ channel: "chrome" });

  const context = await chrome.newContext();
  const page = await context.newPage();

  const sequence = await getRandsFromPage(page, sequenceLength);
  const expected = await getRandsFromPage(page, numberOfPredictions);

  const predictor = JSRandomnessPredictor.chrome(sequence);
  const predictions = [];

  for (let i = 0; i < numberOfPredictions; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  const results = {
    browser: "chrome",
    version: chrome.version(),
    sequence,
    predictions,
    expected,
    isCorrect: predictions.every(
      (prediction, index) => prediction === expected[index],
    ),
  };

  await chrome.close();

  return results;
}

async function testFirefox(sequenceLength, numberOfPredictions) {
  const firefox = await spidermonkey.launch({ headless: true });

  const context = await firefox.newContext();
  const page = await context.newPage();

  const sequence = await getRandsFromPage(page, sequenceLength);
  const expected = await getRandsFromPage(page, numberOfPredictions);

  const predictor = JSRandomnessPredictor.firefox(sequence);
  const predictions = [];

  for (let i = 0; i < numberOfPredictions; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  const results = {
    browser: "firefox",
    version: firefox.version(),
    sequence,
    predictions,
    expected,
    isCorrect: predictions.every(
      (prediction, index) => prediction === expected[index],
    ),
  };

  await firefox.close();

  return results;
}

async function testSafari(sequenceLength, numberOfPredictions) {
  const safari = await webkit.launch();

  const context = await safari.newContext();
  const page = await context.newPage();

  const sequence = await getRandsFromPage(page, sequenceLength);
  const expected = await getRandsFromPage(page, numberOfPredictions);

  const predictor = JSRandomnessPredictor.safari(sequence);
  const predictions = [];

  for (let i = 0; i < numberOfPredictions; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  const results = {
    browser: "safari",
    version: safari.version(),
    sequence,
    predictions,
    expected,
    isCorrect: predictions.every(
      (prediction, index) => prediction === expected[index],
    ),
  };

  await safari.close();

  return results;
}
