console.log("CONTENT SCRIPT LOADED!");

let agentEnabled = false;


// Get sensitive element positions from the CURRENT webpage
function getSensitiveRegions() {

    const regions = [];

    const selectors = [
        { selector: "#email", type: "email" },
        { selector: "#password", type: "password" },
        { selector: "#phone", type: "phone" },
        { selector: "#account", type: "number" }
    ];

    selectors.forEach(item => {

        const element = document.querySelector(item.selector);

        if (element) {

            const rect = element.getBoundingClientRect();

            regions.push({
                type: item.type,
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            });
        }

    });

    return regions;
}


chrome.runtime.onMessage.addListener((message) => {

    if (message.action === "enableAgent") {

        agentEnabled = true;

        console.log("AGENT ENABLED");

        // Detect sensitive regions locally
        const sensitiveRegions = getSensitiveRegions();

        console.log(
            "LOCAL SENSITIVE REGIONS:",
            sensitiveRegions
        );

        // Start observation with sensitive regions
        chrome.runtime.sendMessage({
            action: "capture",
            sensitiveRegions: sensitiveRegions,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        });
    }


    // AGENT ACTION

    if (message.action === "click") {

        const element = document.getElementById(message.target);

        if (element) {

            element.click();

            console.log(
                "Agent clicked:",
                message.target
            );

        } else {

            console.log(
                "Agent could not find:",
                message.target
            );
        }
    }

});