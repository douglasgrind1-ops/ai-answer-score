chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Answer Score extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "ANALYZE_ANSWER") {
    return false;
  }

  (async () => {
    try {
      const response = await fetch("https://www.aianswerscore.com/api/analyze-lite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message.question,
          answer: message.answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        sendResponse({
          ok: false,
          error: data?.error || "Scoring request failed.",
        });
        return;
      }

      sendResponse({
        ok: true,
        data,
      });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  })();

  return true;
});