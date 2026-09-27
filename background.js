console.log("BACKGROUND SCRIPT LOADED!");

chrome.runtime.onMessage.addListener((message, sender) => {

    if (message.action === "capture") {

        chrome.tabs.captureVisibleTab(
            null,
            { format: "jpeg" },
            async (image) => {

                console.log("Screenshot captured!");

                try {

                    const blob = await fetch(image)
                        .then(response => response.blob());

                    const formData = new FormData();

                    // Screenshot
                    formData.append(
                        "image",
                        blob,
                        "screenshot.jpg"
                    );

                    // Sensitive DOM coordinates
                    formData.append(
                        "sensitiveRegions",
                        JSON.stringify(
                            message.sensitiveRegions || []
                        )
                    );

                    // Viewport information
                    formData.append(
                        "viewportWidth",
                        message.viewportWidth
                    );

                    formData.append(
                        "viewportHeight",
                        message.viewportHeight
                    );

                    console.log(
                        "Sending screenshot + LOCAL privacy regions..."
                    );

                    const response = await fetch(
                        "http://localhost:5000/process",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                    if (!response.ok) {

                        throw new Error(
                            `Server returned ${response.status}`
                        );
                    }

                    const result = await response.json();

                    console.log(
                        "Agent result:",
                        result
                    );

                    const action = JSON.parse(result.action);

                    console.log(
                        "Parsed action:",
                        action
                    );

                    if (sender.tab) {

                        chrome.tabs.sendMessage(
                            sender.tab.id,
                            action
                        );
                    }

                } catch (error) {

                    console.error(
                        "AI ERROR:",
                        error
                    );
                }
            }
        );
    }
});