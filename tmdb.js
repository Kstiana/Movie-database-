export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;
  const { query, type = "multi", actorId, mediaId, mediaType, category} = req.query;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB API key is missing in environment variables."});
}

  let url = "";

  try {
    if (query && ["movie", "tv", "person", "multi"].includes(type)) {
      // Search requests
      const encodedQuery = encodeURIComponent(query);
      url = `https://api.themoviedb.org/3/search/${type}?query=${encodedQuery}&include_adult=false&api_key=${apiKey}`;
} else if (actorId && category === "movie_credits") {
      // Actor's movie credits
      url = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`;
} else if (actorId && category === "tv_credits") {
      // Actor's TV credits
      url = `https://api.themoviedb.org/3/person/${actorId}/tv_credits?api_key=${apiKey}`;
} else if (mediaId && mediaType && category === "trailer") {
      // Trailer fetching
      const path = mediaType === "movies"? "movie": "tv";
      url = `https://api.themoviedb.org/3/${path}/${mediaId}/videos?api_key=${apiKey}`;
} else {
      return res.status(400).json({ error: "Invalid or missing parameters in request."});
}

    const response = await fetch(url);
    const data = await response.json();

    // For trailer, return only the first match
    if (category === "trailer") {
      const trailer = data.results?.find(
        (video) => ["YouTube", "Vimeo"].includes(video.site) && video.type === "Trailer"
);
      return res.status(200).json(trailer || null);
}

    // For actor credits, return `cast[]`
    if (["movie_credits", "tv_credits"].includes(category)) {
      return res.status(200).json(data.cast || []);
}

    // For search results
    return res.status(200).json(data.results || []);
} catch (err) {
    console.error("TMDB fetch error:", err);
    res.status(500).json({ error: "Failed to fetch data from TMDB."});
}
}