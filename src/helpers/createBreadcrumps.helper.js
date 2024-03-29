const breadcrumbs = require("../utils/breadcrumbs");

createBreadcrumbs = function (url) {
  let rtn = [{ name: breadcrumbs["HOME"], url: "/" }],
    acc = "";
  const urls = url.substring(1).split("/");

  for (i = 0; i < urls.length; i++) {
    if (i != urls.length - 1) {
      acc = acc + "/" + urls[i];
    }
    const translated = breadcrumbs[urls[i].toUpperCase()];
    rtn[i + 1] = { name: translated, url: acc };
  }
  return rtn;
};

module.exports = createBreadcrumbs;
