const grid = document.querySelector("[data-blog-grid]");
const posts = window.QUIXPRINT_POSTS || [];

if (grid) {
  if (!posts.length) {
    grid.innerHTML = '<div class="blog-empty">No posts have been published yet.</div>';
  } else {
    grid.innerHTML = posts.map(post => `
      <article class="blog-card reveal">
        <a class="blog-card-image" href="/blog/${post.slug}/">
          <img src="${post.thumbnail || post.image}"
            ${post.thumbnailSrcSet ? `srcset="${post.thumbnailSrcSet}" sizes="(max-width: 700px) calc(46vw - 9px), (max-width: 1100px) calc(30.667vw - 17px), (max-width: 1440px) calc(23vw - 19px), calc(358px - 2vw - 16.5px)"` : ""}
            width="640" height="480" decoding="async"
            alt="${post.imageAlt || ""}">
        </a>
        <div class="blog-card-body">
          <div class="blog-meta">${post.date}</div>
          <h2><a href="/blog/${post.slug}/">${post.title}</a></h2>
          <p>${post.excerpt}</p>
          <a class="blog-read" href="/blog/${post.slug}/">Read article <span>→</span></a>
        </div>
      </article>
    `).join("");

    document.querySelectorAll(".reveal").forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 3) * 80}ms`;
      requestAnimationFrame(() => el.classList.add("visible"));
    });
  }
}
