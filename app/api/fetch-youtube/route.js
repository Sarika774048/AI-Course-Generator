// import { NextResponse } from 'next/server';
// import ytsr from 'ytsr';

// export async function POST(request) {
//   try {
//     // 1. Parse Input
//     const body = await request.json();
//     const { courseName, chapterName } = body;

//     // 2. Validate
//     if (!courseName && !chapterName) {
//       return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
//     }

//     console.log(`🚀 API Request (ytsr): ${courseName} - ${chapterName}`);

//     // 3. Define Search Strategies (Priority 1 -> 3)
//     // We will loop through these until we find a video
//     const searchQueries = [
//       `${courseName} ${chapterName} tutorial`,      // Best match
//       `${chapterName} tutorial`,                    // Topic match
//       `programming ${courseName} tutorial`          // Fallback
//     ];

//     let foundVideo = null;

//     // 4. Execution Loop
//     for (const query of searchQueries) {
//         console.log(`🔍 Searching: "${query}"`);
        
//         try {
//             // DIRECT SEARCH (Avoid getFilters as it crashes often)
//             // Fetch top 5 results
//             const searchResults = await ytsr(query, { limit: 5 });

//             if (searchResults && searchResults.items) {
//                 // Filter: Find the first item that is actually a 'video' 
//                 // (ytsr also returns channels, playlists, etc.)
//                 const video = searchResults.items.find(item => 
//                     item.type === 'video' && 
//                     !item.isLive // Avoid live streams if possible
//                 );

//                 if (video) {
//                     foundVideo = video;
//                     break; // Stop searching, we found one!
//                 }
//             }
//         } catch (searchErr) {
//             console.warn(`⚠️ Query failed for "${query}":`, searchErr.message);
//         }
//     }

//     // 5. Final Check
//     if (!foundVideo) {
//         return NextResponse.json({ error: "No video found" }, { status: 404 });
//     }

//     console.log(`✅ Returning: ${foundVideo.title}`);

//     // 6. Return Data
//     return NextResponse.json({
//       result: foundVideo.url,
//       title: foundVideo.title,
//       duration: foundVideo.duration,
//       thumbnail: foundVideo.bestThumbnail?.url
//     }, { status: 200 });

//   } catch (err) {
//     console.error("🔥 API Error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }



import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export async function POST(request) {
  try {
    const { courseName, chapterName } = await request.json();

    if (!courseName || !chapterName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Create Unique Search Queries (Priority Order)
    const searchQueries = [
      // Priority 1: Specific Topic in Context (e.g. "Variables in Python tutorial")
      `${chapterName} in ${courseName} tutorial`,
      
      // Priority 2: Just the Chapter Topic (e.g. "Variables tutorial")
      // This is crucial for variety. It forces YouTube to look for the sub-topic.
      `${chapterName} tutorial`,
      
      // Priority 3: Technical Context (e.g. "coding Variables")
      `coding ${chapterName}`,
      
      // Priority 4: Fallback (The Course Name) - Only reaches here if everything else fails
      `${courseName} tutorial`
    ];

    let video = null;

    // 2. Loop through queries until we find a video
    for (const query of searchQueries) {
        console.log(`🔍 Trying Query: "${query}"`);
        
        try {
            // Fetch top 3 results to ensure we don't get a playlist or channel
            const results = await YouTube.search(query, { limit: 3, safeSearch: true });
            
            // Filter to ensure it's a video and not the same one we found before (if we tracked it)
            const validVideo = results.find(v => v.duration > 0); // Basic check for valid video

            if (validVideo) {
                video = validVideo;
                console.log(`✅ Match Found for: "${chapterName}" -> ${video.title}`);
                break; // Stop loop, we found a unique video
            }
        } catch (e) {
            console.warn(`Query failed: ${query}`);
        }
    }

    // 3. Absolute Fail-Safe (Prevent crashes)
    if (!video) {
        // Return a generic placeholder if literally nothing is found on YouTube (rare)
        return NextResponse.json({
            result: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
            title: "Video Not Found",
            thumbnail: ""
        }, { status: 200 });
    }

    // 4. Return Result
    return NextResponse.json({
      result: `https://www.youtube.com/watch?v=${video.id}`,
      title: video.title,
      duration: video.durationFormatted,
      thumbnail: video.thumbnail?.url
    }, { status: 200 });

  } catch (err) {
    console.error("🔥 API Error:", err);
    // Return 200 with placeholder to prevent Client "Critical HTML" error
    return NextResponse.json({ 
        result: "", 
        title: "Error fetching video" 
    }, { status: 200 });
  }
}