try
{
  importScripts(
    "/app/vendor/vendor.min.js",
    "/app/shared/shared.min.js",
    "/app/background/background.min.js"
  );
}
catch (e)
{
  console.error(e);
}

