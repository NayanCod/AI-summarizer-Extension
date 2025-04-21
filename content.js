function getArticleText(){
    const article = document.querySelector("article");
    if (article) {
        return article.innerText;
    } 
    // else {
    //     return document.body.innerText; // Fallback to body text if no article tag is found
    // }

    const paragraphs = Array.from(document.querySelectorAll("p"));

    return paragraphs.map(p => p.innerText).join("\n\n");

}


chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.type === "GET_ARTICLE_TEXT") {
        const text = getArticleText();
        console.log("Article text:", text);
        sendResponse({ text });
    }
}
);