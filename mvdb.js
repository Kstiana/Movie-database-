document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    searchBtn: document.getElementById('searchBtn'),
    homeBtn: document.getElementById('homeBtn'),
    searchInput: document.getElementById('searchInput'),
    moviesBtn: document.getElementById('moviesBtn'),
    seriesBtn: document.getElementById('seriesBtn'),
    peopleBtn: document.getElementById('peopleBtn'),
    categoryHeading: document.getElementById('categoryHeading'),
    contentContainer: document.getElementById('contentContainer'),
    actorHeading: document.getElementById('actorHeading'),
    actorNameSpan: document.getElementById('actorName'),
    actorContent: document.getElementById('actorContent'),
    message: document.getElementById('message'),
    emptyState: document.getElementById('emptyState'),
    trailerModal: document.getElementById('trailerModal'),
    trailerIframe: document.getElementById('trailerIframe'),
    closeTrailer: document.getElementById('closeTrailer'),
};

  const currentCategory = { value: 'all'};

  const switchCategory = (category) => {
    currentCategory.value = category;
    elements.categoryHeading.textContent =
      category === 'all'
? 'All Search'
: `${category.charAt(0).toUpperCase() + category.slice(1)} Search`;
    elements.categoryHeading.style.display = 'block';
    elements.contentContainer.innerHTML = '';
    elements.actorHeading.style.display = 'none';
    elements.actorContent.innerHTML = '';
    elements.emptyState.style.display = 'none';
    elements.message.textContent = '';
};

  const resetHome = () => {
    elements.searchInput.value = '';
    elements.message.textContent = '';
    elements.categoryHeading.style.display = 'none';
    elements.contentContainer.innerHTML = '';
    elements.actorHeading.style.display = 'none';
    elements.actorContent.innerHTML = '';
    elements.emptyState.style.display = 'none';
    elements.trailerModal.style.display = 'none';
    elements.trailerIframe.src = '';
};

  const showLoadingPlaceholders = () => {
    for (let i = 0; i < 6; i++) {
      const shimmer = document.createElement('div');
      shimmer.className = 'loading-card';
      elements.contentContainer.appendChild(shimmer);
}
};

  const clearLoading = () => {
    elements.contentContainer
.querySelectorAll('.loading-card')
.forEach((card) => card.remove());
};

  const apiFetch = async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`/api/tmdb?${queryString}`);
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
}
      return res.json();
} catch (error) {
      console.error('API fetch error:', error);
      throw error;
}
};

  const searchMovies = (query) => apiFetch({ query, type: 'movie'});
  const searchTV = (query) => apiFetch({ query, type: 'tv'});
  const searchPeople = (query) => apiFetch({ query, type: 'person'});
  const fetchMovieCredits = (actorId) =>
    apiFetch({ actorId, category: 'movie_credits'});
  const fetchTVCredits = (actorId) =>
    apiFetch({ actorId, category: 'tv_credits'});
  const fetchTrailer = (mediaId, mediaType) =>
    apiFetch({ mediaId, mediaType, category: 'trailer'});

  const fetchResults = async (query) => {
    try {
      elements.message.textContent = '';
      elements.contentContainer.innerHTML = '';
      elements.actorContent.innerHTML = '';
      elements.actorHeading.style.display = 'none';
      elements.emptyState.style.display = 'none';
      showLoadingPlaceholders();

      let [movieData, tvData, actorData] = [[], [], []];

      if (['movies', 'all'].includes(currentCategory.value)) {
        movieData = await searchMovies(query);
}

      if (['series', 'all'].includes(currentCategory.value)) {
        tvData = await searchTV(query);
}

      if (['people', 'all'].includes(currentCategory.value)) {
        actorData = await searchPeople(query);
}

      clearLoading();
if (movieData.length || tvData.length || actorData.length) {
        movieData.forEach((movie, i) => displayItem(movie, 'movies', i));
        tvData.forEach((tv, i) => displayItem(tv, 'series', i));
        actorData.forEach((actor, i) => displayActor(actor, i));
} else {
        elements.message.textContent = 'No results found.';
}
} catch (err) {
      console.error('Search error:', err);
      elements.message.textContent =
        'Something went wrong while fetching results.';
      clearLoading();
}
};

  const displayItem = (item, type, index = 0) => {
    if (!item) return;

    const card = document.createElement('div');
    card.className = 'media-card scale-fade-in';
    card.style.animationDelay = `${index * 0.05}s`;

    const poster = item.poster_path
? `https://image.tmdb.org/t/p/w500${item.poster_path}`
: 'https://via.placeholder.com/250x350?text=No+Image';

    const year =
      item.release_date?.split('-')[0] ||
      item.first_air_date?.split('-')[0] ||
      'N/A';

    card.innerHTML = `
      <img src="${poster}" alt="${item.title || item.name}" />
      <div class="media-details">
        <h3>${item.title || item.name || 'Untitled'}</h3>
        <p><strong>Year:</strong> ${year}</p>
        <p><strong>Type:</strong> ${
          type === 'movies'? 'Movie': 'TV Series'
}</p>
        <p><strong>Rating:</strong> ${
          item.vote_average!= null? item.vote_average: 'N/A'
}</p>
        <p>${item.overview || 'No description available.'}</p>
        <button class="trailer-btn" data-id="${item.id}" data-type="${type}">
          <i class="fas fa-play-circle"></i> Play Trailer
        </button>
      </div>
    `;

    elements.contentContainer.appendChild(card);

    const trailerBtn = card.querySelector('.trailer-btn');
    if (trailerBtn) {
      trailerBtn.addEventListener('click', () => {
        const normalizedType = type === 'movies'? 'movie': 'tv';
        fetchAndPlayTrailer(item.id, normalizedType);
});
}
};

  const displayActor = (actor, index = 0) => {
    if (!actor) return;

    const card = document.createElement('div');
    card.className = 'actor-card fade-in-up';
    card.style.animationDelay = `${index * 0.05}s`;

    const profile = actor.profile_path
? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
: 'https://via.placeholder.com/250x350?text=No+Image';

    card.innerHTML = `
      <img src="${profile}" alt="${actor.name}" />
      <div class="actor-details">
        <h3>${actor.name}</h3>
        <p><strong>Known for:</strong> ${actor.known_for_department}</p>
        <p><strong>Popularity:</strong> ${actor.popularity?.toFixed(1) || 'N/A'}</p>
        <p><strong>Click to view their movies & TV shows.</strong></p>
      </div>
    `;

    card.addEventListener('click', () =>
      fetchActorCredits(actor.id, actor.name)
);

    elements.contentContainer.appendChild(card);
};

  const fetchActorCredits = async (actorId, actorName) => {
    try {
      document
.querySelectorAll('.media-card,.actor-card')
.forEach((card) => card.classList.add('fade-out'));
      await new Promise((resolve) => setTimeout(resolve, 400));

      elements.contentContainer.innerHTML = '';
      elements.actorHeading.style.display = 'block';
      elements.actorNameSpan.textContent = actorName;
      elements.message.textContent = `Loading credits for ${actorName}...`;
      elements.emptyState.style.display = 'none';

      const [movies, shows] = await Promise.all([
        fetchMovieCredits(actorId),
        fetchTVCredits(actorId),
      ]);

      if (movies.length || shows.length) {
        elements.message.textContent = `Movies & TV Shows for ${actorName}`;
        movies.forEach((m, i) => displayItem(m, 'movies', i));
        shows.forEach((s, i) => displayItem(s, 'series', i));
} else {
        elements.message.textContent = '';
        elements.emptyState.style.display = 'block';
}
} catch (err) {
      console.error('Actor credit error:', err);
elements.message.textContent = 'Could not load actor details.';
}
};

  const fetchAndPlayTrailer = async (mediaId, mediaType) => {
    try {
      const trailer = await fetchTrailer(mediaId, mediaType);
      if (trailer) {
        const embedURL =
          trailer.site === 'YouTube'
? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`
: `https://player.vimeo.com/video/${trailer.key}`;
        elements.trailerIframe.src = embedURL;
        elements.trailerModal.style.display = 'flex';
} else {
        alert('No trailer available for this title.');
}
} catch (err) {
      console.error('Trailer fetch error:', err);
      alert('Something went wrong trying to load the trailer.');
}
};

if (elements.closeTrailer) {
  elements.closeTrailer.addEventListener('click', () => {
    elements.trailerModal.style.display = 'none';
    elements.trailerIframe.src = '';
});
} else {
  console.warn('closeTrailer button is missing from the DOM.');
}

  if (elements.trailerModal) {
  elements.trailerModal.addEventListener('click', (e) => {
    if (e.target === elements.trailerModal) {
      elements.trailerModal.style.display = 'none';
      elements.trailerIframe.src = '';
}
});
} else {
  console.warn('Missing #trailerModal element in the DOM.');
}
 if (elements.homeBtn) {
  elements.homeBtn.addEventListener('click', resetHome);
} else {
  console.warn('homeBtn not found in DOM');
}

if (elements.moviesBtn) {
  elements.moviesBtn.addEventListener('click', () => switchCategory('movies'));
} else {
  console.warn('moviesBtn not found in DOM');
}

if (elements.seriesBtn) {
  elements.seriesBtn.addEventListener('click', () => switchCategory('series'));
} else {
  console.warn('seriesBtn not found in DOM');
}

if (elements.peopleBtn) {
  elements.peopleBtn.addEventListener('click', () => switchCategory('people'));
} else {
  console.warn('peopleBtn not found in DOM');
}

if (elements.searchBtn) {
  elements.searchBtn.addEventListener('click', () => {
    const query = elements.searchInput?.value.trim();
    if (query) fetchResults(query);
});
} else {
  console.warn('searchBtn not found in DOM');
}

if (elements.searchInput) {
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.searchBtn?.click();
});
} else {
  console.warn('searchInput not found in DOM');
}
});