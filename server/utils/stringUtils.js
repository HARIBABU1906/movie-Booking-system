/**
 * Extracts the YouTube video ID from various formats of YouTube URLs.
 * @param {string} urlOrId - The YouTube URL or just the video ID.
 * @returns {string} - The extracted video ID or the original string if no ID found.
 */
function extractYoutubeId(urlOrId) {
  if (!urlOrId) return "";
  
  // If it's already a short ID (approx 11 chars, no slashes or dots)
  if (urlOrId.length === 11 && !urlOrId.includes("/") && !urlOrId.includes(".")) {
    return urlOrId;
  }

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = urlOrId.match(regex);
  
  return match ? match[1] : urlOrId;
}

module.exports = { extractYoutubeId };
