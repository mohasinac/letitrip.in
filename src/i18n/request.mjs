const { getRequestConfig } = require("next-intl/server");

module.exports = getRequestConfig(async () => {
  return {
    locale: "en",
    messages: {},
  };
});

