const out = txt => document.getElementById("out").textContent = txt;
const imgContainer = document.getElementById("img-container");
const PROXY = "https://corsproxy.io/?";

async function search() {
    out("Searching data...");
    imgContainer.innerHTML = "";
    const input = document.getElementById("url").value.trim();
    const match = input.match(/listings\/(\d+)\/(.+?)(?:\?|$)/);
    if (!match) return out("Invalid URL");

    const appid = match[1];
    const hashName = decodeURIComponent(match[2]);

    try {
        const renderUrl = `https://steamcommunity.com/market/listings/${appid}/${encodeURIComponent(hashName)}/render?count=1&currency=1&format=json`;
        const renderRes = await fetch(PROXY + encodeURIComponent(renderUrl));
        const render = await renderRes.json();

        let name = "(not found)";
        let image = null;

        if (render.assets && render.assets[appid]) {
            const contextId = Object.keys(render.assets[appid])[0];
            const firstAsset = Object.values(render.assets[appid][contextId])[0];
            if (firstAsset) {
                name = firstAsset.market_name || firstAsset.name || name;
                const iconUrl = firstAsset.icon_url_large || firstAsset.icon_url;
                if (iconUrl) image = "https://steamcommunity-a.akamaihd.net/economy/image/" + iconUrl;
            }
        }

        const priceUrl = `https://steamcommunity.com/market/priceoverview/?appid=${appid}&market_hash_name=${encodeURIComponent(hashName)}&currency=3`;
        const priceRes = await fetch(PROXY + encodeURIComponent(priceUrl));
        const price = await priceRes.json();

        const final_price = price.lowest_price || "No data";
        const volume = price.volume || "?";
        const median = price.median_price || "No data";

        out(`Name: ${name}\nLowest price: ${final_price}\nVolume: ${volume}\nMedian price: ${median}`);

        if (image) {
            const img = document.createElement("img");
            img.src = image;
            img.alt = name;
            img.style.maxWidth = "200px";
            img.style.marginTop = "10px";
            imgContainer.appendChild(img);
        }
    } catch (e) {
        out("❌ Error: " + e.message);
    }
}

document.getElementById("go").addEventListener("click", search);