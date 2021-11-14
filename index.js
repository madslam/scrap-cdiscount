const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const randomUseragent = require("random-useragent");
const argv = require("minimist")(process.argv.slice(2));

const linkProduct =
  argv.url ||
  "https://www.cdiscount.com/jeux-pc-video-console/ps5/console-ps5-sony-ps5/f-10350-son3665540797413.html";

const toAddress = argv.email || "produit.dispo.scrap@gmail.com";
const fromAdress = "produit.dispo.scrap@gmail.com";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: fromAdress,
    pass: "AoipQ188ppI",
  },
});
const mailOptions = {
  from: fromAdress,
  to: toAddress,
  subject: "Wesh le produit est disponible bg",
  text: "le produit que tu cherches est dispo ! " + linkProduct,
};

const delay = (time) => {
  let timer = 1;
  let timerId = setInterval(
    () =>
      process.stdout.write(
        `\r ${timer++}/${Math.round((time - 1) / 1000)} seconde `
      ),
    1000
  );

  return new Promise(function (resolve) {
    setTimeout(() => {
      process.stdout.write(`\n `);
      clearInterval(timerId);
      resolve();
    }, time);
  });
};

const sendEmail = () => {
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("email sent");
    }
  });
};

const checkProduct = async () => {
  const userAgent = randomUseragent.getRandom();

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  //Randomize viewport size
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 100),
    height: 3000 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  });
  await page.setUserAgent(userAgent);
  await page.setJavaScriptEnabled(true);
  await page.setDefaultNavigationTimeout(0);

  //Skip images/styles/fonts loading for performance
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (
      req.resourceType() == "stylesheet" ||
      req.resourceType() == "font" ||
      req.resourceType() == "image"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.evaluateOnNewDocument(() => {
    // Pass webdriver check
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Pass chrome check
    window.chrome = {
      runtime: {},
      // etc.
    };
  });

  await page.evaluateOnNewDocument(() => {
    //Pass notifications check
    const originalQuery = window.navigator.permissions.query;
    return (window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "plugins", {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `languages` property to use a custom getter.
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  await page.goto(linkProduct, { waitUntil: "networkidle2", timeout: 0 });

  await delay(2000);
  const [isCaptcha] = await page.$x(
    "//strong[contains(., 'Merci de cocher la case ci-dessous:')]"
  );

  // check presence of captcha
  if (isCaptcha) {
    console.log("captcha detected");
    await browser.close();
    return;
  }

  const inputClass = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll("input[value='Ajouter au panier']"),
      (element) => element.className
    )
  );

  console.log(inputClass);

  if (!inputClass || inputClass.length === 0) {
    console.log("not working");
    await browser.close();
    return;
  }

  const isNotAvalaible = inputClass.find((c) => c.includes("clickDisabled"));
  if (isNotAvalaible) {
    console.log("product is not avalaible");
  } else {
    console.log("product is avalaible");
    await browser.close();
    sendEmail();
    return true;
  }

  await browser.close();
  return false;
};

const interval = setInterval(async () => {
  const isAvalaible = await checkProduct();
  if (isAvalaible) {
    clearInterval(interval);
  }
}, 60000);
