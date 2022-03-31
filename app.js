const path = require("path");
const express = require("express");
const ejs = require("ejs");
const countriesDict = require("./assets/countries-dict.json");
const codeToCountry = require("./assets/code-to-country.json");

const app = express();

function getCountry(key) {
  const name = codeToCountry[key.toUpperCase()];
  if (name) {
    return countriesDict[name];
  }
  return countriesDict[key];
}

app.get("/", async function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

function createMetaTag({ name, property, content }) {
  if (!name && !property) {
    return "";
  }
  const key = name ? "name" : "property";
  return `<meta ${key}="${name || property}" content="${content}" />`;
}

function getMetaTagsString({ title, description, url }) {
  return [
    {
      name: "description",
      content: description,
    },
    {
      property: "twitter:description",
      content: description,
    },
    {
      property: "twitter:title",
      content: title,
    },
    {
      property: "og:url",
      content: url,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:site_name",
      content: "Evochka.com",
    },
  ]
    .map((value) => createMetaTag(value))
    .join("\n");
}

app.get("/:country", async function (req, res) {
  const key = req.params.country.toLowerCase();

  const country = getCountry(key);
  if (!country) {
    res.sendFile(path.join(__dirname, "404.html"));
  } else {
    const pageData = {
      title: country.name,
      content: country.capital,
      meta: getMetaTagsString({
        title: country.name,
        description: `Capital of ${country.name} is ${country.capital}`,
      }),
    };
    ejs.renderFile(
      path.join(__dirname, "country.ejs"),
      pageData,
      function (err, str) {
        if (err) {
          throw new Error(err);
        }
        res.send(str);
      }
    );
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Express server listening on ${port}`);
});
