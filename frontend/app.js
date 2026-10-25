const API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '3000' && window.location.port !== '')) ? 'http://localhost:3000' : '';

let currentUser = null;
let currentSort = 'hot';
let currentSearch = '';
let freeMediaList = [];
let selectedMediaUrl = '';
let currentProfileUsername = null;
let currentProfileTab = 'posts';
let currentViewMode = 'card';
let allPosts = [];
let displayedCount = 10;

const brandLogoBtn = document.getElementById('brandLogoBtn');
const searchInput = document.getElementById('searchInput');
const quickDemoSelect = document.getElementById('quickDemoSelect');
const loggedOutButtons = document.getElementById('loggedOutButtons');
const loggedInArea = document.getElementById('loggedInArea');
const openAppActionBtn = document.getElementById('openAppActionBtn');
const openLoginBtn = document.getElementById('openLoginBtn');
const navbarCreateBtn = document.getElementById('navbarCreateBtn');
const navProfilePill = document.getElementById('navProfilePill');
const navUserAvatar = document.getElementById('navUserAvatar');
const navUserName = document.getElementById('navUserName');
const userMenuFlyout = document.getElementById('userMenuFlyout');
const menuItemProfile = document.getElementById('menuItemProfile');
const menuItemLogout = document.getElementById('menuItemLogout');
const headerMoreBtn = document.getElementById('headerMoreBtn');
const navHamburgerBtn = document.getElementById('navHamburgerBtn');

const navDrawer = document.getElementById('navDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');
const drawerBrandBtn = document.getElementById('drawerBrandBtn');
const drawerHomeBtn = document.getElementById('drawerHomeBtn');
const drawerPopularBtn = document.getElementById('drawerPopularBtn');
const drawerLatestBtn = document.getElementById('drawerLatestBtn');
const drawerRulesBtn = document.getElementById('drawerRulesBtn');
const drawerTosBtn = document.getElementById('drawerTosBtn');
const drawerPrivacyBtn = document.getElementById('drawerPrivacyBtn');

const sortDropdownTrigger = document.getElementById('sortDropdownTrigger');
const currentSortLabel = document.getElementById('currentSortLabel');
const filterRegionBtn = document.getElementById('filterRegionBtn');
const filterViewModeBtn = document.getElementById('filterViewModeBtn');

const feedCreateTrigger = document.getElementById('feedCreateTrigger');
const triggerAvatar = document.getElementById('triggerAvatar');
const quickImageBtn = document.getElementById('quickImageBtn');
const postsFeed = document.getElementById('postsFeed');
const loadMorePostsBtn = document.getElementById('loadMorePostsBtn');
const infiniteScrollStatus = document.getElementById('infiniteScrollStatus');

const sidebarCreateBtn = document.getElementById('sidebarCreateBtn');
const sidebarUserBox = document.getElementById('sidebarUserBox');
const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
const sidebarUserDisplayName = document.getElementById('sidebarUserDisplayName');
const sidebarUserHandle = document.getElementById('sidebarUserHandle');
const sidebarUserBio = document.getElementById('sidebarUserBio');
const sidebarFollowersCount = document.getElementById('sidebarFollowersCount');
const sidebarFollowingCount = document.getElementById('sidebarFollowingCount');
const sidebarViewProfileBtn = document.getElementById('sidebarViewProfileBtn');
const statMembers = document.getElementById('statMembers');
const statOnline = document.getElementById('statOnline');

const authModalEl = document.getElementById('authModal');
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabSignupBtn = document.getElementById('tabSignupBtn');
const authModalTitle = document.getElementById('authModalTitle');
const authForm = document.getElementById('authForm');
const displayNameGroup = document.getElementById('displayNameGroup');
const bioGroup = document.getElementById('bioGroup');
const authDisplayName = document.getElementById('authDisplayName');
const authUsername = document.getElementById('authUsername');
const authPassword = document.getElementById('authPassword');
const authBio = document.getElementById('authBio');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authError = document.getElementById('authError');

const createPostModalEl = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');
const postTitleInput = document.getElementById('postTitleInput');
const postContentInput = document.getElementById('postContentInput');
const freeMediaGrid = document.getElementById('freeMediaGrid');
const postImageFile = document.getElementById('postImageFile');
const clearImageBtn = document.getElementById('clearImageBtn');
const imageSelectedPreview = document.getElementById('imageSelectedPreview');
const postError = document.getElementById('postError');

const profileModalEl = document.getElementById('profileModal');
const profileModalTitle = document.getElementById('profileModalTitle');
const profileViewAvatar = document.getElementById('profileViewAvatar');
const profileViewDisplayName = document.getElementById('profileViewDisplayName');
const profileViewUsername = document.getElementById('profileViewUsername');
const profileViewBio = document.getElementById('profileViewBio');
const profileFollowersNum = document.getElementById('profileFollowersNum');
const profileFollowingNum = document.getElementById('profileFollowingNum');
const profilePostsNum = document.getElementById('profilePostsNum');
const profileKarmaNum = document.getElementById('profileKarmaNum');
const profileFollowToggleBtn = document.getElementById('profileFollowToggleBtn');
const profileEditToggleBtn = document.getElementById('profileEditToggleBtn');
const profileEditSection = document.getElementById('profileEditSection');
const profileEditForm = document.getElementById('profileEditForm');
const editDisplayNameInput = document.getElementById('editDisplayNameInput');
const editBioInput = document.getElementById('editBioInput');
const editAvatarSelect = document.getElementById('editAvatarSelect');
const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
const pTabPosts = document.getElementById('pTabPosts');
const pTabFollowers = document.getElementById('pTabFollowers');
const pTabFollowing = document.getElementById('pTabFollowing');
const profileTabContent = document.getElementById('profileTabContent');

const tosModalEl = document.getElementById('tosModal');
const privacyModalEl = document.getElementById('privacyModal');
const linkUserAgreement = document.getElementById('linkUserAgreement');
const linkPrivacyPolicy = document.getElementById('linkPrivacyPolicy');
const linkContentPolicy = document.getElementById('linkContentPolicy');

const appToastEl = document.getElementById('appToast');
const toastMessage = document.getElementById('toastMessage');

let bsAuthModal = null;
let bsCreatePostModal = null;
let bsProfileModal = null;
let bsTosModal = null;
let bsPrivacyModal = null;
let bsToast = null;

function initBootstrapComponents() {
  if (typeof bootstrap !== 'undefined') {
    bsAuthModal = new bootstrap.Modal(authModalEl);
    bsCreatePostModal = new bootstrap.Modal(createPostModalEl);
    bsProfileModal = new bootstrap.Modal(profileModalEl);
    bsTosModal = new bootstrap.Modal(tosModalEl);
    bsPrivacyModal = new bootstrap.Modal(privacyModalEl);
    bsToast = new bootstrap.Toast(appToastEl);
  }
}

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
}

function showToast(message) {
  toastMessage.textContent = message;
  if (bsToast) {
    bsToast.show();
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatScore(score) {
  if (score === null || score === undefined) return '0';
  const num = Number(score);
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return String(num);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchMe() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    currentUser = null;
    updateAuthUI();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: getAuthHeader() });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
    } else {
      localStorage.removeItem('auth_token');
      currentUser = null;
    }
  } catch (err) {
    currentUser = null;
  }
  updateAuthUI();
}

function updateAuthUI() {
  if (currentUser) {
    loggedOutButtons.classList.add('d-none');
    loggedInArea.classList.remove('d-none');
    loggedInArea.classList.add('d-flex');
    navUserName.textContent = currentUser.username;
    navUserAvatar.src = resolveUrl(currentUser.avatar_url || '/media/avatar1.jpg');
    triggerAvatar.src = resolveUrl(currentUser.avatar_url || '/media/avatar1.jpg');
    sidebarUserBox.classList.remove('d-none');
    sidebarUserAvatar.src = resolveUrl(currentUser.avatar_url || '/media/avatar1.jpg');
    sidebarUserDisplayName.textContent = currentUser.display_name;
    sidebarUserHandle.textContent = `u/${currentUser.username}`;
    sidebarUserBio.textContent = currentUser.bio || 'Systems engineer on r/INCREDIBLE_x_TECH.';
    sidebarFollowersCount.textContent = currentUser.followers_count || 0;
    sidebarFollowingCount.textContent = currentUser.following_count || 0;
  } else {
    loggedOutButtons.classList.remove('d-none');
    loggedInArea.classList.add('d-none');
    loggedInArea.classList.remove('d-flex');
    sidebarUserBox.classList.add('d-none');
    triggerAvatar.src = resolveUrl('/media/avatar1.jpg');
  }
}

async function loadDemoUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/demo-users`);
    const data = await res.json();
    quickDemoSelect.innerHTML = '<option value="">Switch Demo Account</option>';
    data.users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.username;
      opt.textContent = `u/${u.username} (${u.display_name})`;
      quickDemoSelect.appendChild(opt);
    });
  } catch (err) {}
}

async function loginAsDemo(username) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('auth_token', data.token);
      await fetchMe();
      loadPosts();
      showToast(`Logged in as u/${username}`);
    }
  } catch (err) {
    showToast('Failed to switch demo account');
  }
}

quickDemoSelect.addEventListener('change', (e) => {
  const username = e.target.value;
  if (username) {
    loginAsDemo(username);
  }
});

async function loadCommunityStats() {
  try {
    const res = await fetch(`${API_BASE}/api/community/stats`);
    const data = await res.json();
    statMembers.textContent = data.members_count;
    statOnline.textContent = data.online_count;
  } catch (err) {}
}

async function loadFreeMedia() {
  try {
    const res = await fetch(`${API_BASE}/api/free-media`);
    const data = await res.json();
    freeMediaList = data.media || [];
    renderFreeMediaGrid();
  } catch (err) {}
}

function renderFreeMediaGrid() {
  freeMediaGrid.innerHTML = '';
  freeMediaList.forEach(item => {
    const el = document.createElement('div');
    el.className = 'media-picker-item';
    if (selectedMediaUrl === item.url) el.classList.add('selected');
    el.title = item.label;
    el.innerHTML = `<img src="${resolveUrl(item.url)}" alt="${item.label}">`;
    el.addEventListener('click', () => {
      if (selectedMediaUrl === item.url) {
        selectedMediaUrl = '';
        el.classList.remove('selected');
        imageSelectedPreview.textContent = '';
      } else {
        selectedMediaUrl = item.url;
        document.querySelectorAll('.media-picker-item').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        postImageFile.value = '';
        imageSelectedPreview.textContent = `Selected: ${item.label}`;
      }
    });
    freeMediaGrid.appendChild(el);
  });
}

async function loadPosts() {
  postsFeed.innerHTML = '<div class="modern-post-card text-center p-4 text-secondary">Loading discussions...</div>';
  try {
    const url = `${API_BASE}/api/posts?sort=${currentSort}&search=${encodeURIComponent(currentSearch)}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    const data = await res.json();
    allPosts = data.posts || [];
    displayedCount = 10;
    renderVisiblePosts();
  } catch (err) {
    postsFeed.innerHTML = '<div class="modern-post-card text-center p-4 text-danger">Failed to load discussions. Please try again.</div>';
  }
}

function renderVisiblePosts() {
  if (allPosts.length === 0) {
    postsFeed.innerHTML = `
      <div class="modern-post-card text-center p-4 text-secondary">
        <h5 class="text-dark fw-bold">No Discussions Found</h5>
        <p class="mb-0">There are no discussions matching your criteria. Be the first to share technical knowledge.</p>
      </div>
    `;
    loadMorePostsBtn.style.display = 'none';
    return;
  }

  const postsToRender = allPosts.slice(0, displayedCount);
  renderPosts(postsToRender);

  if (displayedCount >= allPosts.length) {
    loadMorePostsBtn.style.display = 'none';
  } else {
    loadMorePostsBtn.style.display = 'inline-block';
  }
}

function renderPosts(posts) {
  postsFeed.innerHTML = '';
  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'modern-post-card';
    card.id = `post-${post.id}`;

    const isUpvoted = post.user_vote === 1;
    const isDownvoted = post.user_vote === -1;
    const isAuthor = currentUser && currentUser.id === post.author.id;
    const isFollowing = post.author.is_following;

    let followBtnHtml = '';
    if (currentUser && !isAuthor) {
      followBtnHtml = `
        <button class="filter-dropdown-btn py-0 px-2 ms-1 text-primary fw-bold" data-author-id="${post.author.id}" style="font-size: 11px;">
          ${isFollowing ? 'Following' : '+ Follow'}
        </button>
      `;
    }

    let mediaHtml = '';
    if (post.image_url) {
      mediaHtml = `
        <div class="post-image-carousel">
          <img src="${resolveUrl(escapeHtml(post.image_url))}" alt="Post Media" loading="lazy">
          <button class="carousel-arrow-btn prev-btn" aria-label="Previous image">‹</button>
          <button class="carousel-arrow-btn next-btn" aria-label="Next image">›</button>
          <div class="carousel-indicator-dots">
            <span class="indicator-dot active"></span>
            <span class="indicator-dot"></span>
            <span class="indicator-dot"></span>
          </div>
        </div>
      `;
    }

    let deleteBtnHtml = '';
    if (isAuthor) {
      deleteBtnHtml = `
        <button class="action-pill-btn delete-btn" data-delete-post="${post.id}" title="Delete Post">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      `;
    }

    card.innerHTML = `
      <div class="post-header-strip">
        <div class="post-header-left">
          <div class="community-icon-circle">r/</div>
          <span class="community-handle-bold" data-community="INCREDIBLE_x_TECH">r/INCREDIBLE_x_TECH</span>
          <span>•</span>
          <span class="post-time-text">${timeAgo(post.created_at)}</span>
          <span>•</span>
          <span class="author-link-tag" data-username="${escapeHtml(post.author.username)}">u/${escapeHtml(post.author.username)}</span>
          ${followBtnHtml}
        </div>
        <button class="header-dots-btn" title="Post options">···</button>
      </div>
      <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
      <div class="post-card-body-text">${escapeHtml(post.content)}</div>
      ${mediaHtml}
      <div class="post-action-pills-row">
        <div class="action-pill-vote">
          <button class="vote-arrow-btn ${isUpvoted ? 'upvoted' : ''}" data-vote="1" title="Upvote" aria-label="Upvote">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3l-7 7h4v7h6v-7h4z"/>
            </svg>
          </button>
          <span class="vote-tally-number ${isUpvoted ? 'upvoted' : isDownvoted ? 'downvoted' : ''}">${formatScore(post.score)}</span>
          <button class="vote-arrow-btn ${isDownvoted ? 'downvoted' : ''}" data-vote="-1" title="Downvote" aria-label="Downvote">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 17l7-7h-4V3H7v7H3z"/>
            </svg>
          </button>
        </div>
        <button class="action-pill-btn toggle-comments-btn" data-post-id="${post.id}">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2C5.58 2 2 5.13 2 9c0 1.94.88 3.7 2.33 4.98L3.5 18l4.4-1.47C8.59 16.8 9.28 17 10 17c4.42 0 8-3.13 8-7s-3.58-7-8-7z"/>
          </svg>
          <span class="comments-count-label">${formatScore(post.comments_count)}</span>
        </button>
        <button class="action-pill-btn share-post-btn" data-post-id="${post.id}" title="Share">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 10l-6-6v3.5C4 8 2 12 2 16c1.5-2 3.5-3 7-3v3.5l6-6.5z"/>
          </svg>
        </button>
        ${deleteBtnHtml}
      </div>
      <div class="post-comments-container" style="display: none;" id="comments-drawer-${post.id}"></div>
    `;

    const upBtn = card.querySelector('.vote-arrow-btn[data-vote="1"]');
    const downBtn = card.querySelector('.vote-arrow-btn[data-vote="-1"]');
    const voteCountEl = card.querySelector('.vote-tally-number');

    upBtn.addEventListener('click', () => handleVote(post.id, 1, upBtn, downBtn, voteCountEl));
    downBtn.addEventListener('click', () => handleVote(post.id, -1, upBtn, downBtn, voteCountEl));

    const authorLink = card.querySelector('.author-link-tag');
    if (authorLink) {
      authorLink.addEventListener('click', () => openUserProfile(post.author.username));
    }

    const followBtn = card.querySelector('[data-author-id]');
    if (followBtn) {
      followBtn.addEventListener('click', () => handleInlineFollow(post.author.id, followBtn));
    }

    const deleteBtn = card.querySelector('[data-delete-post]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => handleDeletePost(post.id));
    }

    const shareBtn = card.querySelector('.share-post-btn');
    shareBtn.addEventListener('click', () => {
      const url = `${window.location.origin}/#post-${post.id}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Direct link copied to clipboard');
      }).catch(() => {
        showToast('Link copied');
      });
    });

    const toggleCommentsBtn = card.querySelector('.toggle-comments-btn');
    const commentsDrawer = card.querySelector(`#comments-drawer-${post.id}`);
    toggleCommentsBtn.addEventListener('click', () => {
      if (commentsDrawer.style.display === 'none') {
        commentsDrawer.style.display = 'flex';
        loadCommentsForPost(post.id, commentsDrawer, card.querySelector('.comments-count-label'));
      } else {
        commentsDrawer.style.display = 'none';
      }
    });

    const carouselArrows = card.querySelectorAll('.carousel-arrow-btn');
    carouselArrows.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dots = card.querySelectorAll('.indicator-dot');
        let activeIdx = 0;
        dots.forEach((dot, idx) => {
          if (dot.classList.contains('active')) activeIdx = idx;
        });
        dots[activeIdx].classList.remove('active');
        if (btn.classList.contains('next-btn')) {
          activeIdx = (activeIdx + 1) % dots.length;
        } else {
          activeIdx = (activeIdx - 1 + dots.length) % dots.length;
        }
        dots[activeIdx].classList.add('active');
      });
    });

    postsFeed.appendChild(card);
  });
}

loadMorePostsBtn.addEventListener('click', () => {
  displayedCount += 10;
  renderVisiblePosts();
});

window.addEventListener('scroll', () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
    if (displayedCount < allPosts.length) {
      displayedCount += 6;
      renderVisiblePosts();
    }
  }
});

async function handleVote(postId, targetVote, upBtn, downBtn, countEl) {
  if (!currentUser) {
    showAuthModal('login');
    showToast('Log in to vote on discussions');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ vote_type: targetVote })
    });
    if (res.ok) {
      const data = await res.json();
      countEl.textContent = formatScore(data.score);
      upBtn.classList.remove('upvoted');
      downBtn.classList.remove('downvoted');
      countEl.classList.remove('upvoted', 'downvoted');

      if (data.user_vote === 1) {
        upBtn.classList.add('upvoted');
        countEl.classList.add('upvoted');
      } else if (data.user_vote === -1) {
        downBtn.classList.add('downvoted');
        countEl.classList.add('downvoted');
      }
    }
  } catch (err) {
    showToast('Error recording vote');
  }
}

async function handleInlineFollow(authorId, buttonEl) {
  if (!currentUser) {
    showAuthModal('login');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/users/${authorId}/follow`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.is_following) {
        buttonEl.textContent = 'Following';
      } else {
        buttonEl.textContent = '+ Follow';
      }
      fetchMe();
    }
  } catch (err) {
    showToast('Error updating follow status');
  }
}

async function handleDeletePost(postId) {
  if (!confirm('Are you sure you want to permanently delete this discussion?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (res.ok) {
      showToast('Discussion removed');
      loadPosts();
      loadCommunityStats();
    } else {
      showToast('Failed to delete discussion');
    }
  } catch (err) {
    showToast('Error deleting post');
  }
}

async function loadCommentsForPost(postId, container, countLabelEl) {
  container.innerHTML = '<div class="text-secondary p-2" style="font-size: 13px;">Loading comments...</div>';
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
    const data = await res.json();
    renderCommentsDrawer(postId, data.comments || [], container, countLabelEl);
  } catch (err) {
    container.innerHTML = '<div class="text-danger p-2" style="font-size: 13px;">Failed to load comments.</div>';
  }
}

function renderCommentsDrawer(postId, comments, container, countLabelEl) {
  container.innerHTML = '';

  const commentFormCard = document.createElement('div');
  commentFormCard.className = 'comment-box-card';
  commentFormCard.innerHTML = `
    <textarea class="form-control" placeholder="What are your thoughts on this architecture?" rows="2"></textarea>
    <div class="d-flex justify-content-end gap-2">
      <button class="btn-open-app py-1 px-3 submit-comment-action" style="font-size: 12px;">Comment</button>
    </div>
  `;

  const textarea = commentFormCard.querySelector('textarea');
  const submitBtn = commentFormCard.querySelector('.submit-comment-action');

  submitBtn.addEventListener('click', async () => {
    if (!currentUser) {
      showAuthModal('login');
      showToast('Log in to participate in technical discussions');
      return;
    }
    const content = textarea.value.trim();
    if (!content) return;

    submitBtn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        textarea.value = '';
        const listRes = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
        const listData = await listRes.json();
        const currentCount = listData.comments.length;
        if (countLabelEl) countLabelEl.textContent = formatScore(currentCount);
        renderCommentsDrawer(postId, listData.comments, container, countLabelEl);
        showToast('Comment submitted');
      } else {
        showToast('Failed to post comment');
      }
    } catch (err) {
      showToast('Error posting comment');
    } finally {
      submitBtn.disabled = false;
    }
  });

  container.appendChild(commentFormCard);

  if (comments.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'text-secondary p-2 text-center';
    emptyNotice.style.fontSize = '13px';
    emptyNotice.textContent = 'No comments yet. Be the first to share your thoughts.';
    container.appendChild(emptyNotice);
    return;
  }

  comments.forEach(comment => {
    const single = document.createElement('div');
    single.className = 'single-comment-card';

    const isCommentAuthor = currentUser && currentUser.id === comment.user.id;
    let deleteCommentHtml = '';
    if (isCommentAuthor) {
      deleteCommentHtml = `
        <button class="btn btn-link btn-sm text-secondary p-0 border-0 ms-2 delete-comment-btn" data-comment-id="${comment.id}" style="font-size: 11px;">
          Delete
        </button>
      `;
    }

    single.innerHTML = `
      <img src="${resolveUrl(comment.user.avatar_url)}" class="comment-avatar-img" alt="Avatar">
      <div class="comment-right-area">
        <div class="comment-user-row">
          <span class="comment-user-name" data-username="${escapeHtml(comment.user.username)}">u/${escapeHtml(comment.user.username)}</span>
          <span class="text-secondary">•</span>
          <span class="text-secondary">${timeAgo(comment.created_at)}</span>
          ${deleteCommentHtml}
        </div>
        <div class="comment-message-body">${escapeHtml(comment.content)}</div>
      </div>
    `;

    const uLink = single.querySelector('.comment-user-name');
    if (uLink) {
      uLink.addEventListener('click', () => openUserProfile(comment.user.username));
    }

    const delCommentBtn = single.querySelector('.delete-comment-btn');
    if (delCommentBtn) {
      delCommentBtn.addEventListener('click', async () => {
        if (!confirm('Delete this comment?')) return;
        try {
          const res = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
          });
          if (res.ok) {
            loadCommentsForPost(postId, container, countLabelEl);
            showToast('Comment deleted');
          }
        } catch (err) {
          showToast('Error deleting comment');
        }
      });
    }

    container.appendChild(single);
  });
}

function showAuthModal(mode) {
  authError.classList.add('d-none');
  authError.textContent = '';
  if (mode === 'signup') {
    tabSignupBtn.classList.add('border-primary', 'active');
    tabLoginBtn.classList.remove('border-primary', 'active');
    authModalTitle.textContent = 'Sign Up';
    displayNameGroup.classList.remove('d-none');
    displayNameGroup.classList.add('d-flex');
    bioGroup.classList.remove('d-none');
    bioGroup.classList.add('d-flex');
    authSubmitBtn.textContent = 'Sign Up';
  } else {
    tabLoginBtn.classList.add('border-primary', 'active');
    tabSignupBtn.classList.remove('border-primary', 'active');
    authModalTitle.textContent = 'Log In';
    displayNameGroup.classList.add('d-none');
    displayNameGroup.classList.remove('d-flex');
    bioGroup.classList.add('d-none');
    bioGroup.classList.remove('d-flex');
    authSubmitBtn.textContent = 'Log In';
  }
  if (bsAuthModal) bsAuthModal.show();
}

tabLoginBtn.addEventListener('click', () => showAuthModal('login'));
tabSignupBtn.addEventListener('click', () => showAuthModal('signup'));
openLoginBtn.addEventListener('click', () => showAuthModal('login'));
openAppActionBtn.addEventListener('click', () => {
  if (currentUser) {
    openCreatePostModal();
  } else {
    showAuthModal('signup');
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('d-none');
  const isSignup = tabSignupBtn.classList.contains('active');
  const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';

  const payload = {
    username: authUsername.value.trim(),
    password: authPassword.value
  };

  if (isSignup) {
    payload.display_name = authDisplayName.value.trim();
    payload.bio = authBio.value.trim();
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      authError.textContent = data.error || 'Authentication failed';
      authError.classList.remove('d-none');
      return;
    }

    localStorage.setItem('auth_token', data.token);
    currentUser = data.user;
    updateAuthUI();
    if (bsAuthModal) bsAuthModal.hide();
    authForm.reset();
    showToast(isSignup ? `Welcome to INCREDIBLE_x_TECH, u/${currentUser.username}!` : `Logged in as u/${currentUser.username}`);
    loadPosts();
    loadCommunityStats();
  } catch (err) {
    authError.textContent = 'Network or server error. Please try again.';
    authError.classList.remove('d-none');
  }
});

navProfilePill.addEventListener('click', (e) => {
  e.stopPropagation();
  userMenuFlyout.classList.toggle('d-none');
});

document.addEventListener('click', () => {
  userMenuFlyout.classList.add('d-none');
});

menuItemProfile.addEventListener('click', () => {
  if (currentUser) {
    openUserProfile(currentUser.username);
  }
});

menuItemLogout.addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeader()
    });
  } catch (err) {}
  localStorage.removeItem('auth_token');
  currentUser = null;
  updateAuthUI();
  showToast('Logged out');
  loadPosts();
});

function openCreatePostModal() {
  if (!currentUser) {
    showAuthModal('login');
    showToast('Log in to create discussions');
    return;
  }
  postError.classList.add('d-none');
  createPostForm.reset();
  selectedMediaUrl = '';
  imageSelectedPreview.textContent = '';
  document.querySelectorAll('.media-picker-item').forEach(el => el.classList.remove('selected'));
  if (bsCreatePostModal) bsCreatePostModal.show();
}

feedCreateTrigger.addEventListener('click', openCreatePostModal);
quickImageBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  openCreatePostModal();
});
navbarCreateBtn.addEventListener('click', openCreatePostModal);
sidebarCreateBtn.addEventListener('click', openCreatePostModal);

clearImageBtn.addEventListener('click', () => {
  selectedMediaUrl = '';
  postImageFile.value = '';
  imageSelectedPreview.textContent = '';
  document.querySelectorAll('.media-picker-item').forEach(el => el.classList.remove('selected'));
});

postImageFile.addEventListener('change', () => {
  if (postImageFile.files.length > 0) {
    selectedMediaUrl = '';
    document.querySelectorAll('.media-picker-item').forEach(el => el.classList.remove('selected'));
    imageSelectedPreview.textContent = `Upload: ${postImageFile.files[0].name}`;
  }
});

createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  postError.classList.add('d-none');

  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();
  if (!title || !content) {
    postError.textContent = 'Title and content are required';
    postError.classList.remove('d-none');
    return;
  }

  let finalImageUrl = selectedMediaUrl;

  if (postImageFile.files.length > 0) {
    const formData = new FormData();
    formData.append('image', postImageFile.files[0]);
    try {
      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }
    } catch (err) {
      postError.textContent = 'Failed to upload custom image';
      postError.classList.remove('d-none');
      return;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        title,
        content,
        image_url: finalImageUrl
      })
    });
    const data = await res.json();
    if (!res.ok) {
      postError.textContent = data.error || 'Failed to publish post';
      postError.classList.remove('d-none');
      return;
    }

    if (bsCreatePostModal) bsCreatePostModal.hide();
    createPostForm.reset();
    showToast('Post published successfully');
    loadPosts();
    loadCommunityStats();
  } catch (err) {
    postError.textContent = 'Server error while creating post';
    postError.classList.remove('d-none');
  }
});

async function openUserProfile(username) {
  currentProfileUsername = username;
  currentProfileTab = 'posts';
  profileEditSection.classList.add('d-none');

  try {
    const res = await fetch(`${API_BASE}/api/users/${username}`, { headers: getAuthHeader() });
    if (!res.ok) {
      showToast('User not found');
      return;
    }
    const data = await res.json();
    const user = data.user;

    profileViewDisplayName.textContent = user.display_name;
    profileViewUsername.textContent = `u/${user.username}`;
    profileViewBio.textContent = user.bio || 'Architect and developer.';
    profileViewAvatar.src = resolveUrl(user.avatar_url);
    profileFollowersNum.textContent = user.followers_count;
    profileFollowingNum.textContent = user.following_count;
    profilePostsNum.textContent = user.posts_count;
    profileKarmaNum.textContent = user.karma;

    const isOwnProfile = currentUser && currentUser.username === user.username;
    if (isOwnProfile) {
      profileFollowToggleBtn.classList.add('d-none');
      profileEditToggleBtn.classList.remove('d-none');
    } else {
      profileEditToggleBtn.classList.add('d-none');
      if (currentUser) {
        profileFollowToggleBtn.classList.remove('d-none');
        if (user.is_following) {
          profileFollowToggleBtn.textContent = 'Following';
        } else {
          profileFollowToggleBtn.textContent = 'Follow';
        }
      } else {
        profileFollowToggleBtn.classList.remove('d-none');
        profileFollowToggleBtn.textContent = 'Follow';
      }
    }

    updateProfileTabButtons();
    loadProfileTabContent();

    if (bsProfileModal) bsProfileModal.show();
  } catch (err) {
    showToast('Error loading profile');
  }
}

sidebarViewProfileBtn.addEventListener('click', () => {
  if (currentUser) {
    openUserProfile(currentUser.username);
  }
});

profileFollowToggleBtn.addEventListener('click', async () => {
  if (!currentUser) {
    showAuthModal('login');
    return;
  }
  try {
    const userRes = await fetch(`${API_BASE}/api/users/${currentProfileUsername}`);
    const userData = await userRes.json();
    const res = await fetch(`${API_BASE}/api/users/${userData.user.id}/follow`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (res.ok) {
      const data = await res.json();
      profileFollowToggleBtn.textContent = data.is_following ? 'Following' : 'Follow';
      profileFollowersNum.textContent = data.followers_count;
      fetchMe();
    }
  } catch (err) {
    showToast('Failed to update follow');
  }
});

profileEditToggleBtn.addEventListener('click', () => {
  profileEditSection.classList.toggle('d-none');
  if (!profileEditSection.classList.contains('d-none') && currentUser) {
    editDisplayNameInput.value = currentUser.display_name;
    editBioInput.value = currentUser.bio || '';
    editAvatarSelect.value = currentUser.avatar_url || '/media/avatar1.jpg';
  }
});

cancelEditProfileBtn.addEventListener('click', () => {
  profileEditSection.classList.add('d-none');
});

profileEditForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        display_name: editDisplayNameInput.value.trim(),
        bio: editBioInput.value.trim(),
        avatar_url: editAvatarSelect.value
      })
    });
    if (res.ok) {
      profileEditSection.classList.add('d-none');
      await fetchMe();
      openUserProfile(currentUser.username);
      showToast('Profile updated');
    }
  } catch (err) {
    showToast('Failed to save profile changes');
  }
});

function updateProfileTabButtons() {
  [pTabPosts, pTabFollowers, pTabFollowing].forEach(btn => {
    btn.classList.remove('active', 'border-primary');
  });
  if (currentProfileTab === 'posts') pTabPosts.classList.add('active', 'border-primary');
  if (currentProfileTab === 'followers') pTabFollowers.classList.add('active', 'border-primary');
  if (currentProfileTab === 'following') pTabFollowing.classList.add('active', 'border-primary');
}

pTabPosts.addEventListener('click', () => {
  currentProfileTab = 'posts';
  updateProfileTabButtons();
  loadProfileTabContent();
});
pTabFollowers.addEventListener('click', () => {
  currentProfileTab = 'followers';
  updateProfileTabButtons();
  loadProfileTabContent();
});
pTabFollowing.addEventListener('click', () => {
  currentProfileTab = 'following';
  updateProfileTabButtons();
  loadProfileTabContent();
});

async function loadProfileTabContent() {
  profileTabContent.innerHTML = '<div class="text-secondary p-3 text-center">Loading...</div>';
  if (currentProfileTab === 'posts') {
    try {
      const res = await fetch(`${API_BASE}/api/posts?author=${encodeURIComponent(currentProfileUsername)}`, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      const userPosts = data.posts || [];
      if (userPosts.length === 0) {
        profileTabContent.innerHTML = '<div class="text-secondary p-3 text-center">No discussions created yet.</div>';
        return;
      }
      profileTabContent.innerHTML = '';
      userPosts.forEach(p => {
        const item = document.createElement('div');
        item.className = 'card p-2';
        item.style.border = '1px solid #CCCCCC';
        item.style.borderRadius = '8px';
        item.innerHTML = `
          <div class="fw-bold" style="font-size: 14px;">${escapeHtml(p.title)}</div>
          <div class="text-secondary" style="font-size: 12px;">${formatScore(p.score)} votes • ${p.comments_count} comments • ${timeAgo(p.created_at)}</div>
        `;
        profileTabContent.appendChild(item);
      });
    } catch (err) {
      profileTabContent.innerHTML = '<div class="text-danger p-3 text-center">Failed to load posts.</div>';
    }
  } else if (currentProfileTab === 'followers') {
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(currentProfileUsername)}/followers`, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      renderUserList(data.followers || []);
    } catch (err) {
      profileTabContent.innerHTML = '<div class="text-danger p-3 text-center">Failed to load followers.</div>';
    }
  } else if (currentProfileTab === 'following') {
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(currentProfileUsername)}/following`, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      renderUserList(data.following || []);
    } catch (err) {
      profileTabContent.innerHTML = '<div class="text-danger p-3 text-center">Failed to load following.</div>';
    }
  }
}

function renderUserList(users) {
  if (users.length === 0) {
    profileTabContent.innerHTML = '<div class="text-secondary p-3 text-center">None found.</div>';
    return;
  }
  profileTabContent.innerHTML = '';
  users.forEach(u => {
    const row = document.createElement('div');
    row.className = 'user-item-row';
    row.innerHTML = `
      <div class="user-item-info">
        <img class="user-item-avatar" src="${resolveUrl(u.avatar_url)}" alt="Avatar">
        <div class="user-item-names">
          <span class="user-item-disp">${escapeHtml(u.display_name)}</span>
          <span class="user-item-user">u/${escapeHtml(u.username)}</span>
        </div>
      </div>
      <div>
        ${(currentUser && currentUser.username !== u.username) ? `
          <button class="btn-open-app py-1 px-3 list-follow-btn" data-uid="${u.id}" style="font-size: 12px;">
            ${u.is_following ? 'Following' : 'Follow'}
          </button>
        ` : ''}
      </div>
    `;

    row.querySelector('.user-item-info').addEventListener('click', () => {
      openUserProfile(u.username);
    });

    const fBtn = row.querySelector('.list-follow-btn');
    if (fBtn) {
      fBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const res = await fetch(`${API_BASE}/api/users/${u.id}/follow`, {
            method: 'POST',
            headers: getAuthHeader()
          });
          if (res.ok) {
            const data = await res.json();
            fBtn.textContent = data.is_following ? 'Following' : 'Follow';
            fetchMe();
          }
        } catch (err) {}
      });
    }

    profileTabContent.appendChild(row);
  });
}

const sortOptions = ['best', 'hot', 'new', 'top'];
let sortIndex = 0;

sortDropdownTrigger.addEventListener('click', () => {
  sortIndex = (sortIndex + 1) % sortOptions.length;
  currentSort = sortOptions[sortIndex];
  const cap = currentSort.charAt(0).toUpperCase() + currentSort.slice(1);
  currentSortLabel.textContent = cap;
  showToast(`Sorting by ${cap}`);
  loadPosts();
});

filterRegionBtn.addEventListener('click', () => {
  showToast('Viewing discussions from Everywhere');
});

filterViewModeBtn.addEventListener('click', () => {
  currentViewMode = currentViewMode === 'card' ? 'compact' : 'card';
  showToast(`View switched to ${currentViewMode} mode`);
});

function openNavDrawer() {
  if (navDrawer && drawerBackdrop) {
    navDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeNavDrawer() {
  if (navDrawer && drawerBackdrop) {
    navDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

if (navHamburgerBtn) {
  navHamburgerBtn.addEventListener('click', openNavDrawer);
}
if (drawerCloseBtn) {
  drawerCloseBtn.addEventListener('click', closeNavDrawer);
}
if (drawerBackdrop) {
  drawerBackdrop.addEventListener('click', closeNavDrawer);
}
if (drawerBrandBtn) {
  drawerBrandBtn.addEventListener('click', () => {
    closeNavDrawer();
    brandLogoBtn.click();
  });
}
if (drawerHomeBtn) {
  drawerHomeBtn.addEventListener('click', () => {
    closeNavDrawer();
    currentSort = 'hot';
    currentSortLabel.textContent = 'Best';
    loadPosts();
  });
}
if (drawerPopularBtn) {
  drawerPopularBtn.addEventListener('click', () => {
    closeNavDrawer();
    currentSort = 'top';
    currentSortLabel.textContent = 'Top';
    loadPosts();
  });
}
if (drawerLatestBtn) {
  drawerLatestBtn.addEventListener('click', () => {
    closeNavDrawer();
    currentSort = 'new';
    currentSortLabel.textContent = 'New';
    loadPosts();
  });
}

document.querySelectorAll('[data-filter-tag]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tag = btn.getAttribute('data-filter-tag');
    closeNavDrawer();
    searchInput.value = tag;
    currentSearch = tag;
    loadPosts();
    showToast(`Filtering by ${tag}`);
  });
});

if (drawerRulesBtn) {
  drawerRulesBtn.addEventListener('click', () => {
    closeNavDrawer();
    showToast('Viewing r/INCREDIBLE_x_TECH Community Rules');
  });
}
if (drawerTosBtn) {
  drawerTosBtn.addEventListener('click', () => {
    closeNavDrawer();
    if (bsTosModal) bsTosModal.show();
  });
}
if (drawerPrivacyBtn) {
  drawerPrivacyBtn.addEventListener('click', () => {
    closeNavDrawer();
    if (bsPrivacyModal) bsPrivacyModal.show();
  });
}

headerMoreBtn.addEventListener('click', () => {
  if (bsTosModal) bsTosModal.show();
});

brandLogoBtn.addEventListener('click', () => {
  searchInput.value = '';
  currentSearch = '';
  loadPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

let searchDebounce = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = searchInput.value.trim();
    loadPosts();
  }, 250);
});

linkUserAgreement.addEventListener('click', (e) => {
  e.preventDefault();
  if (bsTosModal) bsTosModal.show();
});

linkPrivacyPolicy.addEventListener('click', (e) => {
  e.preventDefault();
  if (bsPrivacyModal) bsPrivacyModal.show();
});

linkContentPolicy.addEventListener('click', (e) => {
  e.preventDefault();
  if (bsTosModal) bsTosModal.show();
});

window.addEventListener('DOMContentLoaded', async () => {
  initBootstrapComponents();
  await fetchMe();
  await loadDemoUsers();
  await loadCommunityStats();
  await loadFreeMedia();
  await loadPosts();
});
