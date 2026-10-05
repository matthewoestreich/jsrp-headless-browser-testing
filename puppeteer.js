import JSRandomnessPredictor from "js-randomness-predictor";
import puppeteer from "puppeteer";

(async () => {
  const start = performance.now();

  const chromeResult = await testChrome(4, 10);
  const firefoxResult = await testFirefox(4, 10);

  const end = performance.now();
  const duration = end - start;

  console.log([chromeResult, firefoxResult]);
  console.log(`Puppeteer execution took ${duration.toFixed(4)} ms`);
})();

async function getRandsFromPage(page, numRands) {
  const rands = await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
  return rands;
}

async function testChrome(sequenceLength, numberOfPredictions) {
  const browser = "chrome";
  const chrome = await puppeteer.launch({ browser });

  const page = await chrome.newPage();

  const sequence = await getRandsFromPage(page, sequenceLength);
  const expected = await getRandsFromPage(page, numberOfPredictions);

  const predictor = JSRandomnessPredictor.chrome(sequence);
  const predictions = [];

  for (let i = 0; i < numberOfPredictions; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  const results = {
    browser,
    version: await chrome.version(),
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
  const browser = "firefox";
  const firefox = await puppeteer.launch({ browser });

  const page = await firefox.newPage();

  const sequence = await getRandsFromPage(page, sequenceLength);
  const expected = await getRandsFromPage(page, numberOfPredictions);

  const predictor = JSRandomnessPredictor.firefox(sequence);
  const predictions = [];

  for (let i = 0; i < numberOfPredictions; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  const results = {
    browser,
    version: await firefox.version(),
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
