document.getElementById("summarize").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  const summaryType = document.querySelector(".summary-type").value;

  resultDiv.innerHTML = `<div class="loader"></div>`;

  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if (!geminiApiKey) {
      resultDiv.innerHTML = `No API key set. Click the gear icon to add one`;
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          const text = res.text;
          if (!text) {
            resultDiv.innerHTML = `Couldn't extract text from this page`;
            return;
          }

          try {
            const summary = await getGeminiSummary(
              text,
              summaryType,
              geminiApiKey
            );

            resultDiv.textContent = summary;
          } catch (error) {
            resultDiv.innerHTML = `Gemini Error: ${error.message}`;
          }
        }
      );
    });
  });
});

async function getGeminiSummary(rawText, type, apiKey) {
  const max = 20000;
  const text = rawText.length > max ? rawText.slice(0, max) : rawText;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const promptMap = {
    brief: `Summarize in 2-3 sentences: \n\n${text}`,
    detailed: `Give a detailed summary: \n\n${text}`,
    bullet: `Summarize in 5-7 bullet points (start each line with "- "): \n\n${text}`,
  };
  const prompt = promptMap[type] || promptMap.brief;
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error?.message || "Request failed");
  }

  const data = await res.json();
  console.log("gemin data: ", data);

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary found";
};

document.getElementById("copy-btn").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  const text = resultDiv.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copy-btn");
    const old = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = old;
    }, 2000);
  });
});

document.getElementById("theme-mode").addEventListener("click", () => {
  if(document.body.classList.contains("dark-mode")){
    document.body.classList.remove("dark-mode");
    chrome.storage.sync.set({ theme: "light" });
    document.getElementById("theme-mode").style.fill = "#000";
    document.getElementById("title").style.color = "#000";
  }else{
    document.body.classList.add("dark-mode");
    chrome.storage.sync.set({ theme: "dark" });
    document.getElementById("theme-mode").style.fill = "#fff";
    document.getElementById("title").style.color = "#fff";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["theme"], ({ theme }) => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      document.getElementById("title").style.color = "#fff";
    } else {
      document.body.classList.remove("dark-mode");
      document.getElementById("theme-mode").style.fill = "#000";
      document.getElementById("title").style.color = "#000";
    }
  });
})