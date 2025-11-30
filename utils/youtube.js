export default async function fetchYoutubeUrl(input) {
  // Normalize input
  const payload = typeof input === 'string' 
    ? { courseName: input, chapterName: '', duration: '' } 
    : input;

  try {
    const res = await fetch('/api/fetch-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Check for HTML error pages (Server Crash)
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Critical: API returned HTML. Server might be crashing.");
        return null;
    }

    const data = await res.json();
    
    if (!res.ok) {
        console.warn(`YouTube API Warning: ${data.error}`);
        return null;
    }

    return data.result;

  } catch (err) {
    console.error('Network Error:', err);
    return null;
  }
}