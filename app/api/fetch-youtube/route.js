// // /app/api/fetch-youtube/route.js

// import { NextResponse } from 'next/server';
// import ytsr from 'ytsr';

// export async function POST(request) {
//   try {
//     const { query } = await request.json();
    
//     if (!query) {
//       return NextResponse.json(
//         { error: "Missing search query" }, 
//         { status: 400 }
//       );
//     }

//     // Use ytsr for keyless search
//     const filters = await ytsr.getFilters(query + " tutorial");
//     const videoFilter = filters.get('Type').get('Video');
    
//     const searchResults = await ytsr(videoFilter.url, { limit: 1 });

//     if (!searchResults.items || searchResults.items.length === 0) {
//       return NextResponse.json(
//         { error: "No relevant YouTube video found via scraping." }, 
//         { status: 404 }
//       );
//     }

//     const firstResult = searchResults.items[0];
//     const url = firstResult.url; 
//     const videoTitle = firstResult.title;

//     return NextResponse.json(
//       { title: videoTitle, videoUrl: url }, 
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("YouTube Scraping Error:", err.message);
//     return NextResponse.json(
//       { error: "Video search failed due to internal scraping error. (YouTube structure may have changed)." }, 
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import ytsr from 'ytsr';

export async function POST(request) {
  try {
    // 1. Parse Input
    const body = await request.json();
    const { courseName, chapterName } = body;

    // 2. Validate
    if (!courseName && !chapterName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log(`🚀 API Request (ytsr): ${courseName} - ${chapterName}`);

    // 3. Define Search Strategies (Priority 1 -> 3)
    // We will loop through these until we find a video
    const searchQueries = [
      `${courseName} ${chapterName} tutorial`,      // Best match
      `${chapterName} tutorial`,                    // Topic match
      `programming ${courseName} tutorial`          // Fallback
    ];

    let foundVideo = null;

    // 4. Execution Loop
    for (const query of searchQueries) {
        console.log(`🔍 Searching: "${query}"`);
        
        try {
            // DIRECT SEARCH (Avoid getFilters as it crashes often)
            // Fetch top 5 results
            const searchResults = await ytsr(query, { limit: 5 });

            if (searchResults && searchResults.items) {
                // Filter: Find the first item that is actually a 'video' 
                // (ytsr also returns channels, playlists, etc.)
                const video = searchResults.items.find(item => 
                    item.type === 'video' && 
                    !item.isLive // Avoid live streams if possible
                );

                if (video) {
                    foundVideo = video;
                    break; // Stop searching, we found one!
                }
            }
        } catch (searchErr) {
            console.warn(`⚠️ Query failed for "${query}":`, searchErr.message);
        }
    }

    // 5. Final Check
    if (!foundVideo) {
        return NextResponse.json({ error: "No video found" }, { status: 404 });
    }

    console.log(`✅ Returning: ${foundVideo.title}`);

    // 6. Return Data
    return NextResponse.json({
      result: foundVideo.url,
      title: foundVideo.title,
      duration: foundVideo.duration,
      thumbnail: foundVideo.bestThumbnail?.url
    }, { status: 200 });

  } catch (err) {
    console.error("🔥 API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}