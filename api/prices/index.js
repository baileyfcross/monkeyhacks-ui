module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: {
      ok: true,
      version: "flat-prices-api-test-v1",
      message: "MonkeyHacks Azure Static Web Apps API is working",
      items: [],
      lastUpdated: new Date().toISOString()
    }
  };
};
