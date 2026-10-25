const API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '3000' && window.location.port !== '')) ? 'http://localhost:3000' : '';

let currentUser = null;
let currentSort = 'hot';
let currentSearch = '';
let freeMediaList = [];
let selectedMediaUrl = '';
let currentProfileUsername = null;
let currentProfileTab = 'posts';

const brandLogoBtn = document.getElementById('brandLogoBtn');
const searchInput = document.getElementById('searchInput');
const quickDemoSelect = document.getElementById('quickDemoSelect');
const loggedOutButtons = document.getElementById('loggedOutButtons');
const loggedInArea = document.getElementById('loggedInArea');
const openLoginBtn = document.getElementById('openLoginBtn');
const openSignupBtn = document.getElementById('openSignupBtn');
const navbarCreateBtn = document.getElementById('navbarCreateBtn');
const navProfilePill = document.getElementById('navProfilePill');
const navUserAvatar = document.getElementById('navUserAvatar');
const navUserName = document.getElementById('navUserName');
const navUserKarma = document.getElementById('navUserKarma');
const logoutBtn = document.getElementById('logoutBtn');

const headerJoinBtn = document.getElementById('headerJoinBtn');
const subtabPosts = document.getElementById('subtabPosts');
const subtabRules = document.getElementById('subtabRules');
const subtabWiki = document.getElementById('subtabWiki');
const subtabFaq = document.getElementById('subtabFaq');

const feedCreateTrigger = document.getElementById('feedCreateTrigger');
const triggerAvatar = document.getElementById('triggerAvatar');
const sortHotBtn = document.getElementById('sortHotBtn');
const sortNewBtn = document.getElementById('sortNewBtn');
const sortTopBtn = document.getElementById('sortTopBtn');
const postsFeed = document.getElementById('postsFeed');

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
    sidebarUserBio.textContent = currentUser.bio || 'Technical engineer on r/INCREDIBLE_x_TECH.';
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
      opt.textContent = `Switch to u/${u.username} (${u.display_name})`;
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
  postsFeed.innerHTML = '<div class="reddit-post-card p-4 text-center text-secondary">Loading posts...</div>';
  try {
    const url = `${API_BASE}/api/posts?sort=${currentSort}&search=${encodeURIComponent(currentSearch)}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    const data = await res.json();
    renderPosts(data.posts || []);
  } catch (err) {
    postsFeed.innerHTML = '<div class="reddit-post-card p-4 text-center text-danger">Failed to load posts. Please try again.</div>';
  }
}

function renderPosts(posts) {
  if (posts.length === 0) {
    postsFeed.innerHTML = `
      <div class="reddit-post-card p-4 text-center text-secondary">
        <h5 class="text-dark fw-bold">No Technical Discussions Found</h5>
        <p class="mb-0">There are no posts matching your filter. Be the first to share an engineering architecture post.</p>
      </div>
    `;
    return;
  }

  postsFeed.innerHTML = '';
  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'reddit-post-card';
    card.id = `post-${post.id}`;

    const isUpvoted = post.user_vote === 1;
    const isDownvoted = post.user_vote === -1;
    const isAuthor = currentUser && currentUser.id === post.author.id;
    const isFollowing = post.author.is_following;

    let followBtnHtml = '';
    if (currentUser && !isAuthor) {
      followBtnHtml = `
        <button class="follow-tag-btn ${isFollowing ? 'is-following' : ''}" data-author-id="${post.author.id}">
          ${isFollowing ? 'Following' : 'Follow'}
        </button>
      `;
    }

    let mediaHtml = '';
    if (post.image_url) {
      mediaHtml = `
        <div class="post-media-frame">
          <img src="${resolveUrl(escapeHtml(post.image_url))}" alt="Post Media">
        </div>
      `;
    }

    let deleteBtnHtml = '';
    if (isAuthor) {
      deleteBtnHtml = `
        <button class="post-action-button delete-action" data-delete-post="${post.id}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
          Delete
        </button>
      `;
    }

    card.innerHTML = `
      <div class="vote-rail">
        <button class="vote-button ${isUpvoted ? 'upvote-active' : ''}" data-vote="1" title="Upvote">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
        </button>
        <span class="vote-tally ${isUpvoted ? 'upvote-active' : isDownvoted ? 'downvote-active' : ''}">${post.score}</span>
        <button class="vote-button ${isDownvoted ? 'downvote-active' : ''}" data-vote="-1" title="Downvote">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8h-5V4H9v8H4z"/></svg>
        </button>
      </div>
      <div class="post-content-container">
        <div class="post-top-meta">
          <span class="community-name-link">r/INCREDIBLE_x_TECH</span>
          <span>•</span>
          <span>Posted by</span>
          <span class="author-link" data-username="${escapeHtml(post.author.username)}">u/${escapeHtml(post.author.username)}</span>
          <span>${timeAgo(post.created_at)}</span>
          ${followBtnHtml}
        </div>
        <h2 class="post-headline">${escapeHtml(post.title)}</h2>
        <div class="post-body-text">${escapeHtml(post.content)}</div>
        ${mediaHtml}
        <div class="post-bottom-actions">
          <button class="post-action-button toggle-comments-btn" data-post-id="${post.id}">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.58 2 2 5.13 2 9c0 1.94.88 3.7 2.33 4.98L3.5 18l4.4-1.47C8.59 16.8 9.28 17 10 17c4.42 0 8-3.13 8-7s-3.58-7-8-7z"/></svg>
            <span class="comments-count-text">${post.comments_count} Comments</span>
          </button>
          <button class="post-action-button share-post-btn" data-post-id="${post.id}">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M15 10l-6-6v3.5C4 8 2 12 2 16c1.5-2 3.5-3 7-3v3.5l6-6.5z"/></svg>
            Share
          </button>
          <button class="post-action-button save-post-btn" data-post-id="${post.id}">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2h10a1 1 0 0 1 1 1v15l-6-3.5L4 18V3a1 1 0 0 1 1-1z"/></svg>
            Save
          </button>
          ${deleteBtnHtml}
        </div>
        <div class="comments-thread-box" style="display: none;" id="comments-drawer-${post.id}"></div>
      </div>
    `;

    const upBtn = card.querySelector('.vote-button[data-vote="1"]');
    const downBtn = card.querySelector('.vote-button[data-vote="-1"]');
    const voteCountEl = card.querySelector('.vote-tally');

    upBtn.addEventListener('click', () => handleVote(post.id, 1, upBtn, downBtn, voteCountEl));
    downBtn.addEventListener('click', () => handleVote(post.id, -1, upBtn, downBtn, voteCountEl));

    const authorLink = card.querySelector('.author-link');
    if (authorLink) {
      authorLink.addEventListener('click', () => openUserProfile(post.author.username));
    }

    const followBtn = card.querySelector('.follow-tag-btn');
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

    const saveBtn = card.querySelector('.save-post-btn');
    saveBtn.addEventListener('click', () => {
      showToast('Post saved to your bookmarks');
    });

    const toggleCommentsBtn = card.querySelector('.toggle-comments-btn');
    const commentsDrawer = card.querySelector(`#comments-drawer-${post.id}`);
    toggleCommentsBtn.addEventListener('click', () => {
      if (commentsDrawer.style.display === 'none') {
        commentsDrawer.style.display = 'flex';
        loadCommentsForPost(post.id, commentsDrawer, card.querySelector('.comments-count-text'));
      } else {
        commentsDrawer.style.display = 'none';
      }
    });

    postsFeed.appendChild(card);
  });
}

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
      countEl.textContent = data.score;
      upBtn.classList.remove('upvote-active');
      downBtn.classList.remove('downvote-active');
      countEl.classList.remove('upvote-active', 'downvote-active');

      if (data.user_vote === 1) {
        upBtn.classList.add('upvote-active');
        countEl.classList.add('upvote-active');
      } else if (data.user_vote === -1) {
        downBtn.classList.add('downvote-active');
        countEl.classList.add('downvote-active');
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
        buttonEl.classList.add('is-following');
      } else {
        buttonEl.textContent = 'Follow';
        buttonEl.classList.remove('is-following');
      }
      fetchMe();
    }
  } catch (err) {
    showToast('Error updating follow status');
  }
}

async function handleDeletePost(postId) {
  if (!confirm('Are you sure you want to permanently delete this technical discussion?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (res.ok) {
      showToast('Post removed successfully');
      loadPosts();
      loadCommunityStats();
    }
  } catch (err) {
    showToast('Failed to delete post');
  }
}

async function loadCommentsForPost(postId, container, countTextEl) {
  container.innerHTML = '<div class="text-secondary" style="font-size: 13px;">Loading comments...</div>';
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, { headers: getAuthHeader() });
    const data = await res.json();
    renderCommentsSection(postId, data.comments || [], container, countTextEl);
  } catch (err) {
    container.innerHTML = '<div class="text-danger" style="font-size: 13px;">Failed to load comments.</div>';
  }
}

function renderCommentsSection(postId, comments, container, countTextEl) {
  container.innerHTML = '';

  const inputArea = document.createElement('div');
  inputArea.className = 'd-flex flex-column gap-2';

  if (currentUser) {
    inputArea.innerHTML = `
      <div style="font-size: 12px; color: var(--reddit-meta);">Comment as <strong class="text-dark">u/${escapeHtml(currentUser.username)}</strong></div>
      <div class="comment-composer">
        <textarea id="comment-textarea-${postId}" placeholder="What are your thoughts on this architecture?"></textarea>
        <div class="d-flex justify-content-end">
          <button class="btn-reddit-solid" id="submit-comment-${postId}" style="font-size: 12px; padding: 4px 14px;">Comment</button>
        </div>
      </div>
    `;
    container.appendChild(inputArea);

    const submitBtn = inputArea.querySelector(`#submit-comment-${postId}`);
    const textarea = inputArea.querySelector(`#comment-textarea-${postId}`);
    submitBtn.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) return;
      try {
        const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ content: text })
        });
        if (res.ok) {
          const resData = await res.json();
          textarea.value = '';
          if (countTextEl) countTextEl.textContent = `${resData.comments_count} Comments`;
          loadCommentsForPost(postId, container, countTextEl);
          showToast('Comment submitted');
        }
      } catch (err) {
        showToast('Failed to post comment');
      }
    });
  } else {
    inputArea.innerHTML = `
      <div class="card p-2 text-center text-secondary" style="font-size: 13px; border: 1px solid var(--reddit-border);">
        <a href="#" class="comment-login-trigger text-decoration-none fw-bold">Log in</a> or <a href="#" class="comment-signup-trigger text-decoration-none fw-bold">sign up</a> to participate in the discussion.
      </div>
    `;
    container.appendChild(inputArea);
    inputArea.querySelector('.comment-login-trigger').addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('login');
    });
    inputArea.querySelector('.comment-signup-trigger').addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('signup');
    });
  }

  const listEl = document.createElement('div');
  listEl.className = 'd-flex flex-column gap-2 mt-2';

  if (comments.length === 0) {
    listEl.innerHTML = '<div class="text-secondary py-2" style="font-size: 13px;">No comments yet. Be the first to share an engineering perspective.</div>';
  } else {
    comments.forEach(comment => {
      const item = document.createElement('div');
      item.className = 'comment-entry-row';

      let deleteBtnHtml = '';
      if (comment.can_delete) {
        deleteBtnHtml = `<button class="btn btn-link text-danger p-0 ms-auto text-decoration-none" style="font-size: 11px;" data-delete-comment="${comment.id}">Delete</button>`;
      }

      item.innerHTML = `
        <img class="comment-user-avatar" src="${resolveUrl(escapeHtml(comment.author.avatar_url || '/media/avatar1.jpg'))}" alt="Avatar">
        <div class="comment-main-body">
          <div class="comment-user-header">
            <span class="comment-username" data-username="${escapeHtml(comment.author.username)}">u/${escapeHtml(comment.author.username)}</span>
            <span class="comment-timestamp">${timeAgo(comment.created_at)}</span>
            ${deleteBtnHtml}
          </div>
          <div class="comment-text-content">${escapeHtml(comment.content)}</div>
        </div>
      `;

      item.querySelector('.comment-username').addEventListener('click', () => {
        openUserProfile(comment.author.username);
      });

      const delBtn = item.querySelector('[data-delete-comment]');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          if (!confirm('Delete this comment?')) return;
          try {
            const res = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
              method: 'DELETE',
              headers: getAuthHeader()
            });
            if (res.ok) {
              const resData = await res.json();
              if (countTextEl) countTextEl.textContent = `${resData.comments_count} Comments`;
              loadCommentsForPost(postId, container, countTextEl);
              showToast('Comment deleted');
            }
          } catch (err) {
            showToast('Failed to delete comment');
          }
        });
      }

      listEl.appendChild(item);
    });
  }

  container.appendChild(listEl);
}

function showAuthModal(mode) {
  authError.classList.add('d-none');
  authError.textContent = '';
  authForm.reset();
  if (mode === 'signup') {
    authModalTitle.textContent = 'Sign Up';
    tabSignupBtn.classList.add('active', 'border-primary');
    tabLoginBtn.classList.remove('active', 'border-primary');
    displayNameGroup.classList.remove('d-none');
    displayNameGroup.classList.add('d-flex');
    bioGroup.classList.remove('d-none');
    bioGroup.classList.add('d-flex');
    authSubmitBtn.textContent = 'Sign Up';
  } else {
    authModalTitle.textContent = 'Log In';
    tabLoginBtn.classList.add('active', 'border-primary');
    tabSignupBtn.classList.remove('active', 'border-primary');
    displayNameGroup.classList.add('d-none');
    displayNameGroup.classList.remove('d-flex');
    bioGroup.classList.add('d-none');
    bioGroup.classList.remove('d-flex');
    authSubmitBtn.textContent = 'Log In';
  }
  if (bsAuthModal) bsAuthModal.show();
}

openLoginBtn.addEventListener('click', () => showAuthModal('login'));
openSignupBtn.addEventListener('click', () => showAuthModal('signup'));

tabLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showAuthModal('login');
});

tabSignupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showAuthModal('signup');
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('d-none');
  const isSignup = tabSignupBtn.classList.contains('active');
  const endpoint = isSignup ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;

  const payload = {
    username: authUsername.value.trim(),
    password: authPassword.value
  };

  if (isSignup) {
    payload.display_name = authDisplayName.value.trim();
    payload.bio = authBio.value.trim();
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('auth_token', data.token);
      if (bsAuthModal) bsAuthModal.hide();
      await fetchMe();
      loadPosts();
      loadDemoUsers();
      loadCommunityStats();
      showToast(isSignup ? 'Welcome to INCREDIBLE_x_TECH' : 'Logged in successfully');
    } else {
      authError.textContent = data.error || 'Authentication failed';
      authError.classList.remove('d-none');
    }
  } catch (err) {
    authError.textContent = 'Network or server error';
    authError.classList.remove('d-none');
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers: getAuthHeader() });
  } catch (err) {}
  localStorage.removeItem('auth_token');
  currentUser = null;
  updateAuthUI();
  loadPosts();
  showToast('Logged out');
});

function openCreateModal() {
  if (!currentUser) {
    showAuthModal('login');
    showToast('Log in to create an engineering discussion');
    return;
  }
  createPostForm.reset();
  postError.classList.add('d-none');
  selectedMediaUrl = '';
  imageSelectedPreview.textContent = '';
  document.querySelectorAll('.media-picker-item').forEach(d => d.classList.remove('selected'));
  if (bsCreatePostModal) bsCreatePostModal.show();
}

feedCreateTrigger.addEventListener('click', openCreateModal);
navbarCreateBtn.addEventListener('click', openCreateModal);
sidebarCreateBtn.addEventListener('click', openCreateModal);

clearImageBtn.addEventListener('click', () => {
  selectedMediaUrl = '';
  postImageFile.value = '';
  imageSelectedPreview.textContent = '';
  document.querySelectorAll('.media-picker-item').forEach(d => d.classList.remove('selected'));
});

postImageFile.addEventListener('change', () => {
  if (postImageFile.files.length > 0) {
    selectedMediaUrl = '';
    document.querySelectorAll('.media-picker-item').forEach(d => d.classList.remove('selected'));
    imageSelectedPreview.textContent = `Custom file selected: ${postImageFile.files[0].name}`;
  }
});

createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  postError.classList.add('d-none');
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();

  if (!title || !content) {
    postError.textContent = 'Title and body text are required';
    postError.classList.remove('d-none');
    return;
  }

  let finalImageUrl = selectedMediaUrl;

  if (postImageFile.files.length > 0) {
    const formData = new FormData();
    formData.append('image', postImageFile.files[0]);
    try {
      const upRes = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });
      const upData = await upRes.json();
      if (!upRes.ok) {
        postError.textContent = upData.error || 'Failed to upload image file';
        postError.classList.remove('d-none');
        return;
      }
      finalImageUrl = upData.url;
    } catch (err) {
      postError.textContent = 'Upload failed';
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
    if (res.ok) {
      if (bsCreatePostModal) bsCreatePostModal.hide();
      currentSort = 'new';
      updateSortButtons();
      loadPosts();
      loadCommunityStats();
      fetchMe();
      showToast('Discussion published to r/INCREDIBLE_x_TECH');
    } else {
      postError.textContent = data.error || 'Failed to publish post';
      postError.classList.remove('d-none');
    }
  } catch (err) {
    postError.textContent = 'Network error while creating post';
    postError.classList.remove('d-none');
  }
});

async function openUserProfile(username) {
  currentProfileUsername = username;
  currentProfileTab = 'posts';
  profileEditSection.classList.add('d-none');
  if (bsProfileModal) bsProfileModal.show();
  await refreshProfileView();
}

async function refreshProfileView() {
  if (!currentProfileUsername) return;
  profileTabContent.innerHTML = '<div class="text-secondary p-3 text-center" style="font-size: 13px;">Loading profile data...</div>';
  try {
    const res = await fetch(`${API_BASE}/api/users/${currentProfileUsername}`, { headers: getAuthHeader() });
    if (!res.ok) {
      profileTabContent.innerHTML = '<div class="card p-3 text-center text-secondary">User not found</div>';
      return;
    }
    const data = await res.json();
    const user = data.user;

    profileModalTitle.textContent = `u/${user.username}'s Profile`;
    profileViewAvatar.src = resolveUrl(user.avatar_url || '/media/avatar1.jpg');
    profileViewDisplayName.textContent = user.display_name;
    profileViewUsername.textContent = `u/${user.username}`;
    profileViewBio.textContent = user.bio || 'Technical engineer on r/INCREDIBLE_x_TECH.';
    profileFollowersNum.textContent = user.followers_count;
    profileFollowingNum.textContent = user.following_count;
    profilePostsNum.textContent = user.posts_count;
    profileKarmaNum.textContent = user.karma;

    const isOwn = currentUser && currentUser.id === user.id;

    if (isOwn) {
      profileFollowToggleBtn.classList.add('d-none');
      profileEditToggleBtn.classList.remove('d-none');
    } else {
      profileEditToggleBtn.classList.add('d-none');
      profileFollowToggleBtn.classList.remove('d-none');
      if (user.is_following) {
        profileFollowToggleBtn.textContent = 'Following';
        profileFollowToggleBtn.className = 'btn-reddit-bordered py-1 px-3';
      } else {
        profileFollowToggleBtn.textContent = 'Follow';
        profileFollowToggleBtn.className = 'btn-reddit-solid py-1 px-3';
      }
      profileFollowToggleBtn.onclick = async () => {
        if (!currentUser) {
          showAuthModal('login');
          return;
        }
        const followRes = await fetch(`${API_BASE}/api/users/${user.id}/follow`, {
          method: 'POST',
          headers: getAuthHeader()
        });
        if (followRes.ok) {
          await refreshProfileView();
          await fetchMe();
        }
      };
    }

    editDisplayNameInput.value = user.display_name;
    editBioInput.value = user.bio || '';
    editAvatarSelect.value = user.avatar_url || '/media/avatar1.jpg';

    updateProfileTabButtons();
    loadProfileTabContent(user);
  } catch (err) {
    profileTabContent.innerHTML = '<div class="card p-3 text-center text-danger">Error loading profile data.</div>';
  }
}

profileEditToggleBtn.addEventListener('click', () => {
  if (profileEditSection.classList.contains('d-none')) {
    profileEditSection.classList.remove('d-none');
  } else {
    profileEditSection.classList.add('d-none');
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
        display_name: editDisplayNameInput.value,
        bio: editBioInput.value,
        avatar_url: editAvatarSelect.value
      })
    });
    if (res.ok) {
      profileEditSection.classList.add('d-none');
      await fetchMe();
      await refreshProfileView();
      loadPosts();
      showToast('Profile updated');
    }
  } catch (err) {
    showToast('Failed to update profile');
  }
});

function updateProfileTabButtons() {
  pTabPosts.classList.remove('active', 'border-primary');
  pTabFollowers.classList.remove('active', 'border-primary');
  pTabFollowing.classList.remove('active', 'border-primary');
  if (currentProfileTab === 'posts') pTabPosts.classList.add('active', 'border-primary');
  if (currentProfileTab === 'followers') pTabFollowers.classList.add('active', 'border-primary');
  if (currentProfileTab === 'following') pTabFollowing.classList.add('active', 'border-primary');
}

pTabPosts.addEventListener('click', () => {
  currentProfileTab = 'posts';
  updateProfileTabButtons();
  refreshProfileView();
});

pTabFollowers.addEventListener('click', () => {
  currentProfileTab = 'followers';
  updateProfileTabButtons();
  refreshProfileView();
});

pTabFollowing.addEventListener('click', () => {
  currentProfileTab = 'following';
  updateProfileTabButtons();
  refreshProfileView();
});

async function loadProfileTabContent(targetUser) {
  profileTabContent.innerHTML = '<div class="text-secondary p-3 text-center" style="font-size: 13px;">Loading data...</div>';
  if (currentProfileTab === 'posts') {
    try {
      const res = await fetch(`${API_BASE}/api/posts?author=${targetUser.username}&sort=new`, { headers: getAuthHeader() });
      const data = await res.json();
      const posts = data.posts || [];
      if (posts.length === 0) {
        profileTabContent.innerHTML = '<div class="card p-3 text-center text-secondary">No technical posts submitted by this user yet.</div>';
        return;
      }
      profileTabContent.innerHTML = '';
      posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'reddit-post-card mb-2';
        item.innerHTML = `
          <div class="vote-rail">
            <span class="vote-tally">${post.score}</span>
          </div>
          <div class="post-content-container">
            <div class="post-top-meta">
              <span>Posted ${timeAgo(post.created_at)}</span>
              <span>•</span>
              <span>${post.comments_count} comments</span>
            </div>
            <h5 class="post-headline" style="font-size: 15px;">${escapeHtml(post.title)}</h5>
            <div class="post-body-text" style="font-size: 13px;">${escapeHtml(post.content)}</div>
          </div>
        `;
        profileTabContent.appendChild(item);
      });
    } catch (err) {
      profileTabContent.innerHTML = '<div class="card p-3 text-center text-danger">Failed to load posts</div>';
    }
  } else if (currentProfileTab === 'followers') {
    try {
      const res = await fetch(`${API_BASE}/api/users/${targetUser.username}/followers`, { headers: getAuthHeader() });
      const data = await res.json();
      renderUserList(data.followers || [], 'No followers yet.');
    } catch (err) {
      profileTabContent.innerHTML = '<div class="card p-3 text-center text-danger">Failed to load followers</div>';
    }
  } else if (currentProfileTab === 'following') {
    try {
      const res = await fetch(`${API_BASE}/api/users/${targetUser.username}/following`, { headers: getAuthHeader() });
      const data = await res.json();
      renderUserList(data.following || [], 'Not following any users yet.');
    } catch (err) {
      profileTabContent.innerHTML = '<div class="card p-3 text-center text-danger">Failed to load following list</div>';
    }
  }
}

function renderUserList(users, emptyMessage) {
  if (users.length === 0) {
    profileTabContent.innerHTML = `<div class="card p-3 text-center text-secondary">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  profileTabContent.innerHTML = '';
  users.forEach(u => {
    const row = document.createElement('div');
    row.className = 'user-item-row';

    let followBtnHtml = '';
    const isOwn = currentUser && currentUser.id === u.id;
    if (currentUser && !isOwn) {
      followBtnHtml = `
        <button class="btn btn-sm ${u.is_following ? 'btn-light border' : 'btn-reddit-solid'} py-1 px-3 fw-bold follow-action-btn" style="font-size: 11px; border-radius: 20px;" data-uid="${u.id}">
          ${u.is_following ? 'Following' : 'Follow'}
        </button>
      `;
    }

    row.innerHTML = `
      <div class="user-item-info" data-view-username="${escapeHtml(u.username)}">
        <img class="user-item-avatar" src="${resolveUrl(escapeHtml(u.avatar_url || '/media/avatar1.jpg'))}" alt="Avatar">
        <div class="user-item-names">
          <span class="user-item-disp">${escapeHtml(u.display_name)}</span>
          <span class="user-item-user">u/${escapeHtml(u.username)}</span>
        </div>
      </div>
      <div>
        ${followBtnHtml}
      </div>
    `;

    row.querySelector('.user-item-info').addEventListener('click', () => {
      openUserProfile(u.username);
    });

    const fBtn = row.querySelector('.follow-action-btn');
    if (fBtn) {
      fBtn.addEventListener('click', async () => {
        try {
          const res = await fetch(`${API_BASE}/api/users/${u.id}/follow`, {
            method: 'POST',
            headers: getAuthHeader()
          });
          if (res.ok) {
            await refreshProfileView();
            await fetchMe();
          }
        } catch (err) {
          showToast('Action failed');
        }
      });
    }

    profileTabContent.appendChild(row);
  });
}

navProfilePill.addEventListener('click', () => {
  if (currentUser) openUserProfile(currentUser.username);
});

sidebarViewProfileBtn.addEventListener('click', () => {
  if (currentUser) openUserProfile(currentUser.username);
});

headerJoinBtn.addEventListener('click', () => {
  if (headerJoinBtn.classList.contains('joined')) {
    headerJoinBtn.classList.remove('joined');
    headerJoinBtn.textContent = 'Join';
    showToast('Left r/INCREDIBLE_x_TECH');
  } else {
    headerJoinBtn.classList.add('joined');
    headerJoinBtn.textContent = 'Joined';
    showToast('Joined r/INCREDIBLE_x_TECH');
  }
});

subtabPosts.addEventListener('click', (e) => {
  e.preventDefault();
  subtabPosts.classList.add('active');
  subtabRules.classList.remove('active');
  subtabWiki.classList.remove('active');
  subtabFaq.classList.remove('active');
  currentSort = 'hot';
  updateSortButtons();
  loadPosts();
});

subtabRules.addEventListener('click', (e) => {
  e.preventDefault();
  subtabPosts.classList.remove('active');
  subtabRules.classList.add('active');
  subtabWiki.classList.remove('active');
  subtabFaq.classList.remove('active');
  showToast('Viewing community rules');
});

subtabWiki.addEventListener('click', (e) => {
  e.preventDefault();
  showToast('Wiki documentation: High-Performance Systems & Modern Architecture');
});

subtabFaq.addEventListener('click', (e) => {
  e.preventDefault();
  showToast('Frequently Asked Questions: Community moderation and technical guidelines');
});

document.querySelectorAll('[data-username]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    openUserProfile(el.getAttribute('data-username'));
  });
});

function updateSortButtons() {
  sortHotBtn.classList.remove('active');
  sortNewBtn.classList.remove('active');
  sortTopBtn.classList.remove('active');
  if (currentSort === 'hot') {
    sortHotBtn.classList.add('active');
  }
  if (currentSort === 'new') {
    sortNewBtn.classList.add('active');
  }
  if (currentSort === 'top') {
    sortTopBtn.classList.add('active');
  }
}

sortHotBtn.addEventListener('click', () => {
  currentSort = 'hot';
  updateSortButtons();
  loadPosts();
});

sortNewBtn.addEventListener('click', () => {
  currentSort = 'new';
  updateSortButtons();
  loadPosts();
});

sortTopBtn.addEventListener('click', () => {
  currentSort = 'top';
  updateSortButtons();
  loadPosts();
});

let searchDebounce = null;
searchInput.addEventListener('input', (e) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = e.target.value.trim();
    loadPosts();
  }, 250);
});

brandLogoBtn.addEventListener('click', () => {
  currentSort = 'hot';
  currentSearch = '';
  searchInput.value = '';
  updateSortButtons();
  loadPosts();
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

async function initApp() {
  initBootstrapComponents();
  await fetchMe();
  await loadDemoUsers();
  await loadCommunityStats();
  await loadFreeMedia();
  await loadPosts();
}

document.addEventListener('DOMContentLoaded', initApp);
