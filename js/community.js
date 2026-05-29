/* ============================================
   BOXSPEC – COMMUNITY v2
   Feed, Forum, Sparring-Börse, Leaderboard,
   Public Profiles, Fight Analysis
   Firebase Firestore + Storage
   ============================================ */

var _communityTab = 'feed';
var _feedLastDoc = null;
var _feedLoading = false;
var _feedObserver = null;
var _forumCategory = 'alle';
var _forumSort = 'neu';
var _forumLastDoc = null;
var _forumLoading = false;
var FEED_PAGE_SIZE = 10;
var FORUM_PAGE_SIZE = 15;

// ===== MAIN PAGE =====
function renderCommunityPage() {
  var el = document.getElementById('page-community');
  if (!el) return;
  var tab = _communityTab || 'feed';

  // Ensure profile exists on first visit
  if (_fbUser && _fbDb) ensurePublicProfile();

  el.innerHTML =
    // Hero header with community stats
    '<div class="cm-hero">' +
      '<div class="cm-hero-bg"></div>' +
      '<div class="cm-hero-content">' +
        '<div class="page-title">COMM<span>UNITY</span></div>' +
        '<div class="cm-hero-sub">Verbinde dich. Trainiere zusammen. Werde besser.</div>' +
        '<div class="cm-stats-bar" id="cm-stats-bar">' +
          '<div class="cm-stat-item"><span class="cm-stat-num" id="cm-stat-posts">--</span><span class="cm-stat-label">Beiträge</span></div>' +
          '<div class="cm-stat-divider"></div>' +
          '<div class="cm-stat-item"><span class="cm-stat-num" id="cm-stat-threads">--</span><span class="cm-stat-label">Threads</span></div>' +
          '<div class="cm-stat-divider"></div>' +
          '<div class="cm-stat-item"><span class="cm-stat-num" id="cm-stat-members">--</span><span class="cm-stat-label">Fighter</span></div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // Tab navigation — 5 tabs
    '<div class="cm-tabs">' +
      '<button class="cm-tab' + (tab === 'feed' ? ' active' : '') + '" onclick="switchCommunityTab(\'feed\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' +
        '<span>Feed</span>' +
      '</button>' +
      '<button class="cm-tab' + (tab === 'forum' ? ' active' : '') + '" onclick="switchCommunityTab(\'forum\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<span>Forum</span>' +
      '</button>' +
      '<button class="cm-tab' + (tab === 'sparring' ? ' active' : '') + '" onclick="switchCommunityTab(\'sparring\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
        '<span>Sparring</span>' +
      '</button>' +
      '<button class="cm-tab' + (tab === 'ranking' ? ' active' : '') + '" onclick="switchCommunityTab(\'ranking\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
        '<span>Ranking</span>' +
      '</button>' +
      '<button class="cm-tab' + (tab === 'profil' ? ' active' : '') + '" onclick="switchCommunityTab(\'profil\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        '<span>Profil</span>' +
      '</button>' +
    '</div>' +

    '<div id="cm-content"></div>';

  loadCommunityStats();
  switchCommunityTab(tab);
}

function switchCommunityTab(tab) {
  _communityTab = tab;
  document.querySelectorAll('.cm-tab').forEach(function(b) { b.classList.remove('active'); });
  var active = document.querySelector('.cm-tab[onclick*="' + tab + '"]');
  if (active) active.classList.add('active');

  if (tab === 'feed') renderFeedTab();
  else if (tab === 'forum') renderForumTab();
  else if (tab === 'sparring') renderSparringTab();
  else if (tab === 'ranking') renderRankingTab();
  else if (tab === 'profil') renderMyProfileTab();
}

function loadCommunityStats() {
  if (!_fbDb) return;
  // Get counts (simple approach — count docs)
  _fbDb.collection('community_posts').orderBy('createdAt', 'desc').limit(1).get().then(function(snap) {
    var el = document.getElementById('cm-stat-posts');
    if (el) el.textContent = snap.size > 0 ? '...' : '0';
  });
  // We'll show real counts once there's data, for now show placeholder
  var postsEl = document.getElementById('cm-stat-posts');
  var threadsEl = document.getElementById('cm-stat-threads');
  var membersEl = document.getElementById('cm-stat-members');

  _fbDb.collection('community_posts').get().then(function(s) { if (postsEl) postsEl.textContent = s.size; });
  _fbDb.collection('community_threads').get().then(function(s) { if (threadsEl) threadsEl.textContent = s.size; });
}

// ===== UTILS =====
function timeAgo(ts) {
  if (!ts) return '';
  var d = ts.toDate ? ts.toDate() : new Date(ts);
  var now = new Date();
  var diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'gerade eben';
  if (diff < 3600) return Math.floor(diff / 60) + ' Min.';
  if (diff < 86400) return Math.floor(diff / 3600) + ' Std.';
  if (diff < 604800) return Math.floor(diff / 86400) + ' T.';
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function communityAuthorHTML(name, weight, exp, verified, uid, avatarUrl) {
  var badge = verified ? '<span class="cm-verified" title="Verifizierter Trainer">&#10003;</span>' : '';
  var weightBadge = weight ? '<span class="cm-weight-badge">' + weight + 'kg</span>' : '';
  var expBadge = '';
  if (exp === 'wettkampf') expBadge = '<span class="cm-exp-pill cm-exp-wettkampf">WETTKAMPF</span>';
  else if (exp === 'profi') expBadge = '<span class="cm-exp-pill cm-exp-profi">PROFI</span>';
  var click = uid ? ' onclick="viewPublicProfile(\'' + uid + '\')" style="cursor:pointer;"' : '';
  var avatarInner = avatarUrl ? '<img src="' + avatarUrl + '" class="cm-avatar-img">' : (name ? name.charAt(0).toUpperCase() : '?');
  return '<div class="cm-author"' + click + '>' +
    '<div class="cm-avatar">' + avatarInner + '</div>' +
    '<div class="cm-author-info">' +
      '<div class="cm-author-name">' + (name || 'Anonym') + badge + ' ' + expBadge + '</div>' +
      (weight ? '<div class="cm-author-detail">' + weightBadge + '</div>' : '') +
    '</div>' +
  '</div>';
}

// ===== MEDIA UPLOAD =====
function compressImage(file, maxWidth, quality, callback) {
  var img = new Image();
  var reader = new FileReader();
  reader.onload = function(e) {
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(callback, 'image/jpeg', quality);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function uploadMedia(file, path, progressEl, callback) {
  var ref = _fbStorage.ref().child(path);
  function doUpload(blob) {
    var task = ref.put(blob);
    task.on('state_changed',
      function(snap) {
        var pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        if (progressEl) progressEl.style.width = pct + '%';
      },
      function(err) { showToast('Upload fehlgeschlagen', 'error'); callback(null); },
      function() { task.snapshot.ref.getDownloadURL().then(function(url) { callback(url); }); }
    );
  }
  if (file.type.startsWith('image/')) {
    compressImage(file, 1200, 0.8, function(blob) { doUpload(blob); });
  } else if (file.type.startsWith('video/')) {
    if (file.size > 50 * 1024 * 1024) { showToast('Video max. 50MB', 'error'); callback(null); return; }
    doUpload(file);
  } else { doUpload(file); }
}

// ===== PUBLIC PROFILE INIT =====
function ensurePublicProfile() {
  if (!_fbUser || !_fbDb) return;
  _fbDb.collection('users').doc(_fbUser.uid).get().then(function(doc) {
    if (doc.exists && doc.data().publicProfile) return; // Already exists
    var users = safeParse('fos_users', {});
    var u = users[currentUser] || {};
    _fbDb.collection('users').doc(_fbUser.uid).set({
      publicProfile: {
        displayName: u.nickname || currentUser,
        weight: u.weight || '',
        experience: u.experienceLevel || '',
        gym: u.gym || '',
        record: { wins: 0, losses: 0, draws: 0 },
        bio: '',
        avatarUrl: '',
        isTrainer: false,
        joinedAt: firebase.firestore.FieldValue.serverTimestamp()
      }
    }, { merge: true });
  });
}

// ===== FEED TAB =====
function renderFeedTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;

  content.innerHTML =
    // Trending topics bar
    '<div class="cm-trending">' +
      '<div class="cm-trending-label">TRENDING</div>' +
      '<div class="cm-trending-tags">' +
        '<span class="cm-trending-tag" onclick="searchFeed(\'sparring\')">Sparring</span>' +
        '<span class="cm-trending-tag" onclick="searchFeed(\'kampf\')">Kampfvorbereitung</span>' +
        '<span class="cm-trending-tag" onclick="searchFeed(\'technik\')">Technik-Tipps</span>' +
        '<span class="cm-trending-tag" onclick="searchFeed(\'ernaehrung\')">Ernährung</span>' +
      '</div>' +
    '</div>' +

    // Create post card
    '<div class="cm-create-card" onclick="openCreatePostModal()">' +
      '<div class="cm-create-avatar">' + (currentUser ? currentUser.charAt(0).toUpperCase() : '?') + '</div>' +
      '<div class="cm-create-placeholder">Was möchtest du teilen?</div>' +
      '<div class="cm-create-types">' +
        '<span class="cm-create-type-icon" title="Bild">&#128247;</span>' +
        '<span class="cm-create-type-icon" title="Video">&#127909;</span>' +
        '<span class="cm-create-type-icon" title="Analyse">&#128202;</span>' +
      '</div>' +
    '</div>' +

    // Feed filters
    '<div class="cm-feed-filters">' +
      '<button class="cm-feed-filter active" onclick="filterFeed(this,\'alle\')">Alle</button>' +
      '<button class="cm-feed-filter" onclick="filterFeed(this,\'text\')">Text</button>' +
      '<button class="cm-feed-filter" onclick="filterFeed(this,\'image\')">Bilder</button>' +
      '<button class="cm-feed-filter" onclick="filterFeed(this,\'video\')">Videos</button>' +
      '<button class="cm-feed-filter" onclick="filterFeed(this,\'analysis_request\')">Analysen</button>' +
    '</div>' +

    '<div id="cm-feed-list"></div>' +
    '<div id="cm-feed-sentinel" style="height:1px;"></div>' +
    '<div id="cm-feed-loading" class="cm-loading" style="display:none;"><div class="cm-spinner"></div>Lädt Beiträge...</div>' +
    '<div id="cm-feed-empty" style="display:none;" class="cm-empty">' +
      '<div class="cm-empty-icon">&#128064;</div>' +
      '<div class="cm-empty-title">Noch keine Beiträge</div>' +
      '<div class="cm-empty-text">Sei der Erste und teile dein Training mit der Community!</div>' +
      '<button class="cm-submit-btn" onclick="openCreatePostModal()" style="margin-top:16px;">Ersten Beitrag erstellen</button>' +
    '</div>';

  _feedLastDoc = null;
  loadFeedPosts(true);
  setupFeedObserver();
}

function searchFeed(tag) { showToast('Suche nach: ' + tag, 'info'); }

function filterFeed(btn, type) {
  document.querySelectorAll('.cm-feed-filter').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  // TODO: filter by type
  _feedLastDoc = null;
  loadFeedPosts(true);
}

function setupFeedObserver() {
  if (_feedObserver) _feedObserver.disconnect();
  var sentinel = document.getElementById('cm-feed-sentinel');
  if (!sentinel) return;
  _feedObserver = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !_feedLoading) loadFeedPosts(false);
  }, { rootMargin: '300px' });
  _feedObserver.observe(sentinel);
}

function loadFeedPosts(reset) {
  if (_feedLoading || !_fbDb) return;
  _feedLoading = true;
  var loadingEl = document.getElementById('cm-feed-loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  var q = _fbDb.collection('community_posts').orderBy('createdAt', 'desc').limit(FEED_PAGE_SIZE);
  if (!reset && _feedLastDoc) q = q.startAfter(_feedLastDoc);

  q.get().then(function(snap) {
    if (snap.docs.length) _feedLastDoc = snap.docs[snap.docs.length - 1];
    var posts = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    renderFeedPosts(posts, reset);
    _feedLoading = false;
    if (loadingEl) loadingEl.style.display = 'none';
    if (reset && posts.length === 0) {
      var empty = document.getElementById('cm-feed-empty');
      if (empty) empty.style.display = 'block';
    }
  }).catch(function(err) {
    console.error('Feed load error:', err);
    _feedLoading = false;
    if (loadingEl) loadingEl.style.display = 'none';
    if (reset) {
      var empty = document.getElementById('cm-feed-empty');
      if (empty) empty.style.display = 'block';
    }
  });
}

function renderFeedPosts(posts, reset) {
  var list = document.getElementById('cm-feed-list');
  if (!list) return;
  if (reset) list.innerHTML = '';
  posts.forEach(function(post) { list.insertAdjacentHTML('beforeend', renderFeedCard(post)); });
}

function renderFeedCard(post) {
  var myUid = _fbUser ? _fbUser.uid : '';
  var liked = post.likedBy && post.likedBy.indexOf(myUid) !== -1;
  var mediaHTML = '';
  if (post.mediaUrl) {
    if (post.type === 'video') {
      mediaHTML = '<div class="cm-card-media"><video src="' + post.mediaUrl + '" controls preload="metadata" playsinline></video></div>';
    } else {
      mediaHTML = '<div class="cm-card-media"><img src="' + post.mediaUrl + '" alt="Post" loading="lazy"></div>';
    }
  }

  var typeIcon = '';
  if (post.type === 'fight_result') typeIcon = '<span class="cm-type-badge cm-type-fight"><span class="cm-type-icon-inner">&#129354;</span> KAMPFERGEBNIS</span>';
  else if (post.type === 'analysis_request') typeIcon = '<span class="cm-type-badge cm-type-analysis"><span class="cm-type-icon-inner">&#127916;</span> ANALYSE</span>';
  else if (post.type === 'sparring') typeIcon = '<span class="cm-type-badge cm-type-sparring"><span class="cm-type-icon-inner">&#129354;</span> SPARRING</span>';
  else if (post.type === 'image') typeIcon = '<span class="cm-type-badge cm-type-image"><span class="cm-type-icon-inner">&#128247;</span> FOTO</span>';
  else if (post.type === 'video') typeIcon = '<span class="cm-type-badge cm-type-video"><span class="cm-type-icon-inner">&#127909;</span> VIDEO</span>';

  var engagementHTML = '';
  var totalEngagement = (post.likeCount || 0) + (post.commentCount || 0);
  if (totalEngagement > 5) {
    engagementHTML = '<div class="cm-hot-indicator">&#128293; Hot</div>';
  }

  return '<div class="cm-card" id="post-' + post.id + '">' +
    '<div class="cm-card-header">' +
      communityAuthorHTML(post.authorName, post.authorWeight, post.authorExp, post.authorVerified, post.uid, post.authorAvatarUrl) +
      '<div class="cm-card-header-right">' +
        '<span class="cm-time">' + timeAgo(post.createdAt) + '</span>' +
        (post.uid === myUid ? '<button class="cm-card-menu" onclick="event.stopPropagation();deletePost(\'' + post.id + '\')" title="Löschen">&times;</button>' : '') +
      '</div>' +
    '</div>' +
    (typeIcon ? '<div class="cm-card-type-row">' + typeIcon + engagementHTML + '</div>' : (engagementHTML ? '<div class="cm-card-type-row">' + engagementHTML + '</div>' : '')) +
    (post.title ? '<div class="cm-card-title">' + post.title + '</div>' : '') +
    '<div class="cm-card-body">' + (post.body || '').replace(/\n/g, '<br>') + '</div>' +
    mediaHTML +
    '<div class="cm-card-actions">' +
      '<button class="cm-action-btn' + (liked ? ' liked' : '') + '" onclick="toggleLike(\'' + post.id + '\')">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="' + (liked ? 'var(--red)' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '<span>' + (post.likeCount || 0) + '</span>' +
      '</button>' +
      '<button class="cm-action-btn" onclick="toggleComments(\'' + post.id + '\')">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<span>' + (post.commentCount || 0) + '</span>' +
      '</button>' +
      '<button class="cm-action-btn" onclick="sharePost(\'' + post.id + '\')">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
        '<span>Teilen</span>' +
      '</button>' +
    '</div>' +
    '<div class="cm-comments" id="comments-' + post.id + '" style="display:none;"></div>' +
  '</div>';
}

function sharePost(postId) { showToast('Link kopiert!', 'success'); }

// ===== LIKES =====
function toggleLike(postId) {
  if (!_fbUser || !_fbDb) return;
  var ref = _fbDb.collection('community_posts').doc(postId);
  var myUid = _fbUser.uid;
  var card = document.getElementById('post-' + postId);
  if (!card) return;
  var likeBtn = card.querySelector('.cm-action-btn');
  var isLiked = likeBtn.classList.contains('liked');

  if (isLiked) {
    likeBtn.classList.remove('liked');
    likeBtn.querySelector('svg').setAttribute('fill', 'none');
    var count = parseInt(likeBtn.querySelector('span').textContent) || 0;
    likeBtn.querySelector('span').textContent = Math.max(0, count - 1);
    ref.update({ likedBy: firebase.firestore.FieldValue.arrayRemove(myUid), likeCount: firebase.firestore.FieldValue.increment(-1) });
  } else {
    likeBtn.classList.add('liked');
    likeBtn.querySelector('svg').setAttribute('fill', 'var(--red)');
    var count2 = parseInt(likeBtn.querySelector('span').textContent) || 0;
    likeBtn.querySelector('span').textContent = count2 + 1;
    ref.update({ likedBy: firebase.firestore.FieldValue.arrayUnion(myUid), likeCount: firebase.firestore.FieldValue.increment(1) });
  }
}

// ===== COMMENTS =====
function toggleComments(postId) {
  var el = document.getElementById('comments-' + postId);
  if (!el) return;
  if (el.style.display === 'none') { el.style.display = 'block'; loadComments(postId); }
  else { el.style.display = 'none'; }
}

function loadComments(postId) {
  var el = document.getElementById('comments-' + postId);
  if (!el || !_fbDb) return;
  el.innerHTML = '<div class="cm-loading cm-loading-sm"><div class="cm-spinner-sm"></div></div>';

  _fbDb.collection('community_posts').doc(postId).collection('comments')
    .orderBy('createdAt', 'asc').limit(50).get()
    .then(function(snap) {
      var comments = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      el.innerHTML = comments.map(function(c) {
        return '<div class="cm-comment">' +
          '<div class="cm-comment-avatar">' + ((c.authorName || '?').charAt(0).toUpperCase()) + '</div>' +
          '<div class="cm-comment-content">' +
            '<div class="cm-comment-header">' +
              '<strong>' + (c.authorName || 'Anonym') + '</strong>' +
              '<span class="cm-time">' + timeAgo(c.createdAt) + '</span>' +
            '</div>' +
            '<div class="cm-comment-body">' + (c.body || '').replace(/\n/g, '<br>') + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
      '<div class="cm-comment-form">' +
        '<div class="cm-comment-form-avatar">' + (currentUser ? currentUser.charAt(0).toUpperCase() : '?') + '</div>' +
        '<input type="text" id="comment-input-' + postId + '" placeholder="Kommentar schreiben..." class="cm-comment-input" onkeydown="if(event.key===\'Enter\')submitComment(\'' + postId + '\')">' +
        '<button onclick="submitComment(\'' + postId + '\')" class="cm-comment-submit">&#10148;</button>' +
      '</div>';
    }).catch(function() {
      el.innerHTML = '<div class="cm-empty-small">Kommentare konnten nicht geladen werden.</div>';
    });
}

function submitComment(postId) {
  var input = document.getElementById('comment-input-' + postId);
  if (!input || !input.value.trim() || !_fbUser || !_fbDb) return;
  var body = input.value.trim();
  input.value = '';
  var users = safeParse('fos_users', {});
  var u = users[currentUser] || {};

  _fbDb.collection('community_posts').doc(postId).collection('comments').add({
    uid: _fbUser.uid, authorName: u.nickname || currentUser, body: body,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    _fbDb.collection('community_posts').doc(postId).update({ commentCount: firebase.firestore.FieldValue.increment(1) });
    loadComments(postId);
    var card = document.getElementById('post-' + postId);
    if (card) {
      var btns = card.querySelectorAll('.cm-action-btn');
      if (btns[1]) { var cnt = parseInt(btns[1].querySelector('span').textContent) || 0; btns[1].querySelector('span').textContent = cnt + 1; }
    }
  });
}

// ===== CREATE POST =====
function openCreatePostModal() {
  var existing = document.getElementById('cm-post-modal');
  if (existing) { existing.classList.add('active'); return; }

  var modal = document.createElement('div');
  modal.id = 'cm-post-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML =
    '<div class="modal cm-modal">' +
      '<div class="modal-header">' +
        '<div class="modal-title">NEUER BEITRAG</div>' +
        '<button class="modal-close" onclick="closeCreatePostModal()">&times;</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="cm-post-types">' +
          '<button class="cm-post-type active" onclick="selectPostType(this,\'text\')"><span>&#9998;</span> Text</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'image\')"><span>&#128247;</span> Bild</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'video\')"><span>&#127909;</span> Video</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'sparring\')"><span>&#129354;</span> Sparring</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'analysis_request\')"><span>&#128202;</span> Analyse</button>' +
        '</div>' +
        '<input type="hidden" id="cm-post-type" value="text">' +
        '<input type="text" id="cm-post-title" placeholder="Titel (optional)" class="cm-input" style="display:none;">' +
        '<textarea id="cm-post-body" placeholder="Was möchtest du teilen?" class="cm-textarea" rows="4"></textarea>' +
        '<div id="cm-media-section" style="display:none;">' +
          '<label class="cm-file-label">' +
            '<input type="file" id="cm-post-file" accept="image/*,video/*" onchange="previewPostMedia(this)" style="display:none;">' +
            '<span>&#128206; Datei auswählen</span>' +
          '</label>' +
          '<div id="cm-media-preview"></div>' +
          '<div class="cm-progress-bar"><div id="cm-upload-progress" class="cm-progress-fill"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="cm-submit-btn" onclick="submitFeedPost()">&#10148; Posten</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function closeCreatePostModal() {
  var modal = document.getElementById('cm-post-modal');
  if (modal) modal.classList.remove('active');
}

function selectPostType(btn, type) {
  document.querySelectorAll('.cm-post-type').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('cm-post-type').value = type;
  var mediaSection = document.getElementById('cm-media-section');
  var titleInput = document.getElementById('cm-post-title');
  mediaSection.style.display = (type === 'image' || type === 'video' || type === 'analysis_request') ? 'block' : 'none';
  titleInput.style.display = (type === 'analysis_request' || type === 'sparring') ? 'block' : 'none';
}

function previewPostMedia(input) {
  var preview = document.getElementById('cm-media-preview');
  if (!preview || !input.files[0]) return;
  var file = input.files[0];
  if (file.type.startsWith('image/')) {
    preview.innerHTML = '<img src="' + URL.createObjectURL(file) + '" style="max-width:100%;border-radius:8px;margin-top:8px;">';
  } else if (file.type.startsWith('video/')) {
    preview.innerHTML = '<video src="' + URL.createObjectURL(file) + '" controls style="max-width:100%;border-radius:8px;margin-top:8px;"></video>';
  }
}

function submitFeedPost() {
  if (!_fbUser || !_fbDb) { showToast('Bitte einloggen', 'error'); return; }
  var type = document.getElementById('cm-post-type').value;
  var body = document.getElementById('cm-post-body').value.trim();
  var title = document.getElementById('cm-post-title').value.trim();
  if (!body && type === 'text') { showToast('Schreib etwas', 'error'); return; }

  var users = safeParse('fos_users', {});
  var u = users[currentUser] || {};
  var fileInput = document.getElementById('cm-post-file');
  var file = fileInput && fileInput.files[0];

  var postData = {
    uid: _fbUser.uid, authorName: u.nickname || currentUser,
    authorWeight: u.weight || '', authorExp: u.experienceLevel || '',
    authorVerified: false, authorAvatarUrl: '',
    type: type, title: title, body: body, mediaUrl: '',
    likeCount: 0, commentCount: 0, likedBy: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (file) {
    var progressEl = document.getElementById('cm-upload-progress');
    var path = 'posts/' + _fbUser.uid + '/' + Date.now() + '_' + file.name;
    uploadMedia(file, path, progressEl, function(url) {
      if (!url) return;
      postData.mediaUrl = url;
      savePost(postData);
    });
  } else { savePost(postData); }
}

function savePost(postData) {
  _fbDb.collection('community_posts').add(postData).then(function() {
    showToast('Gepostet!', 'success');
    closeCreatePostModal();
    _feedLastDoc = null;
    loadFeedPosts(true);
  }).catch(function(err) { showToast('Fehler: ' + err.message, 'error'); });
}

function deletePost(postId) {
  if (!confirm('Beitrag wirklich löschen?')) return;
  _fbDb.collection('community_posts').doc(postId).delete().then(function() {
    var card = document.getElementById('post-' + postId);
    if (card) card.remove();
    showToast('Gelöscht', 'success');
  });
}

// ===== FORUM TAB =====
var _forumCategories = [
  { id: 'alle', label: 'ALLE', icon: '&#9776;', color: '#6b6b80' },
  { id: 'technik', label: 'TECHNIK', icon: '&#129354;', color: '#E8000D' },
  { id: 'ernaehrung', label: 'ERNÄHRUNG', icon: '&#127822;', color: '#22C55E' },
  { id: 'kampf', label: 'KAMPF', icon: '&#128165;', color: '#F97316' },
  { id: 'training', label: 'TRAINING', icon: '&#9889;', color: '#3B82F6' },
  { id: 'allgemein', label: 'TALK', icon: '&#128172;', color: '#A855F7' }
];

function renderForumTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;

  content.innerHTML =
    // Category cards
    '<div class="cm-forum-categories">' +
      _forumCategories.map(function(c) {
        return '<button class="cm-forum-cat-card' + (c.id === _forumCategory ? ' active' : '') + '" onclick="filterForum(\'' + c.id + '\')" style="--cat-color:' + c.color + ';">' +
          '<span class="cm-forum-cat-icon">' + c.icon + '</span>' +
          '<span class="cm-forum-cat-label">' + c.label + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +

    // Sort + Create
    '<div class="cm-forum-toolbar">' +
      '<div class="cm-forum-sort">' +
        '<button class="cm-sort-btn' + (_forumSort === 'neu' ? ' active' : '') + '" onclick="sortForum(\'neu\')">&#128337; Neu</button>' +
        '<button class="cm-sort-btn' + (_forumSort === 'top' ? ' active' : '') + '" onclick="sortForum(\'top\')">&#11014; Top</button>' +
        '<button class="cm-sort-btn' + (_forumSort === 'aktiv' ? ' active' : '') + '" onclick="sortForum(\'aktiv\')">&#128293; Aktiv</button>' +
      '</div>' +
      '<button class="cm-create-thread-btn" onclick="openCreateThreadModal()">+ Thread</button>' +
    '</div>' +

    '<div id="cm-forum-list"></div>' +
    '<div id="cm-forum-sentinel" style="height:1px;"></div>' +
    '<div id="cm-forum-loading" class="cm-loading" style="display:none;"><div class="cm-spinner"></div></div>' +
    '<div id="cm-forum-empty" style="display:none;" class="cm-empty">' +
      '<div class="cm-empty-icon">&#128172;</div>' +
      '<div class="cm-empty-title">Noch keine Threads</div>' +
      '<div class="cm-empty-text">Starte die erste Diskussion!</div>' +
      '<button class="cm-submit-btn" onclick="openCreateThreadModal()" style="margin-top:16px;">Ersten Thread erstellen</button>' +
    '</div>';

  _forumLastDoc = null;
  loadThreads(true);
}

function filterForum(cat) {
  _forumCategory = cat;
  document.querySelectorAll('.cm-forum-cat-card').forEach(function(b) { b.classList.remove('active'); });
  var active = document.querySelector('.cm-forum-cat-card[onclick*="' + cat + '"]');
  if (active) active.classList.add('active');
  _forumLastDoc = null;
  loadThreads(true);
}

function sortForum(sort) {
  _forumSort = sort;
  document.querySelectorAll('.cm-sort-btn').forEach(function(b) { b.classList.remove('active'); });
  var active = document.querySelector('.cm-sort-btn[onclick*="' + sort + '"]');
  if (active) active.classList.add('active');
  _forumLastDoc = null;
  loadThreads(true);
}

function loadThreads(reset) {
  if (_forumLoading || !_fbDb) return;
  _forumLoading = true;
  var loadingEl = document.getElementById('cm-forum-loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  var sortField = _forumSort === 'top' ? 'voteScore' : (_forumSort === 'aktiv' ? 'lastReplyAt' : 'createdAt');
  var q;
  if (_forumCategory !== 'alle') {
    q = _fbDb.collection('community_threads').where('category', '==', _forumCategory).orderBy(sortField, 'desc').limit(FORUM_PAGE_SIZE);
  } else {
    q = _fbDb.collection('community_threads').orderBy(sortField, 'desc').limit(FORUM_PAGE_SIZE);
  }
  if (!reset && _forumLastDoc) q = q.startAfter(_forumLastDoc);

  q.get().then(function(snap) {
    if (snap.docs.length) _forumLastDoc = snap.docs[snap.docs.length - 1];
    var threads = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    renderThreadList(threads, reset);
    _forumLoading = false;
    if (loadingEl) loadingEl.style.display = 'none';
    if (reset && threads.length === 0) {
      var empty = document.getElementById('cm-forum-empty');
      if (empty) empty.style.display = 'block';
    }
  }).catch(function(err) {
    console.error('Forum load error:', err);
    _forumLoading = false;
    if (loadingEl) loadingEl.style.display = 'none';
    if (reset) { var empty = document.getElementById('cm-forum-empty'); if (empty) empty.style.display = 'block'; }
  });
}

function renderThreadList(threads, reset) {
  var list = document.getElementById('cm-forum-list');
  if (!list) return;
  if (reset) list.innerHTML = '';

  var catMap = {};
  _forumCategories.forEach(function(c) { catMap[c.id] = c; });

  threads.forEach(function(t) {
    var cat = catMap[t.category] || catMap['allgemein'];
    var isHot = (t.replyCount || 0) >= 5;

    list.insertAdjacentHTML('beforeend',
      '<div class="cm-thread-row" onclick="openThread(\'' + t.id + '\')">' +
        '<div class="cm-thread-votes">' +
          '<div class="cm-vote-arrow">&#9650;</div>' +
          '<span class="cm-vote-score">' + (t.voteScore || 0) + '</span>' +
          '<div class="cm-vote-arrow">&#9660;</div>' +
        '</div>' +
        '<div class="cm-thread-content">' +
          '<div class="cm-thread-badges">' +
            '<span class="cm-cat-badge" style="background:' + cat.color + '18;color:' + cat.color + ';border-color:' + cat.color + '33;">' + cat.icon + ' ' + cat.label + '</span>' +
            (isHot ? '<span class="cm-hot-badge">&#128293; HOT</span>' : '') +
            (t.pinned ? '<span class="cm-pinned-badge">&#128204; PINNED</span>' : '') +
          '</div>' +
          '<div class="cm-thread-title">' + (t.title || 'Ohne Titel') + '</div>' +
          '<div class="cm-thread-meta">' +
            '<span class="cm-thread-author">' + (t.authorName || 'Anonym') + (t.authorVerified ? ' <span class="cm-verified">&#10003;</span>' : '') + '</span>' +
            '<span class="cm-meta-dot">&#183;</span>' +
            '<span>' + timeAgo(t.createdAt) + '</span>' +
            '<span class="cm-meta-dot">&#183;</span>' +
            '<span>' + (t.replyCount || 0) + ' Antworten</span>' +
          '</div>' +
        '</div>' +
        '<div class="cm-thread-reply-count">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span>' + (t.replyCount || 0) + '</span>' +
        '</div>' +
      '</div>'
    );
  });
}

// ===== SPARRING-BÖRSE TAB =====
function renderSparringTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;
  content.innerHTML =
    '<div class="cm-sparring-header">' +
      '<div class="cm-sparring-title">Finde Sparringspartner in deiner Nähe</div>' +
      '<button class="cm-submit-btn" onclick="openSparringModal()">+ Gesuch aufgeben</button>' +
    '</div>' +
    '<div class="cm-sparring-filters">' +
      '<select class="cm-input cm-sparring-select" onchange="filterSparring(this.value)">' +
        '<option value="alle">Alle Gewichte</option>' +
        '<option value="57">bis 57 kg</option>' +
        '<option value="63">bis 63 kg</option>' +
        '<option value="69">bis 69 kg</option>' +
        '<option value="75">bis 75 kg</option>' +
        '<option value="81">bis 81 kg</option>' +
        '<option value="91">bis 91 kg</option>' +
        '<option value="91+">über 91 kg</option>' +
      '</select>' +
    '</div>' +
    '<div id="cm-sparring-list"></div>' +
    '<div id="cm-sparring-empty" class="cm-empty">' +
      '<div class="cm-empty-icon">&#129354;</div>' +
      '<div class="cm-empty-title">Noch keine Sparring-Gesuche</div>' +
      '<div class="cm-empty-text">Gib das erste Gesuch auf und finde deinen nächsten Sparringspartner!</div>' +
    '</div>';

  loadSparringPosts();
}

function loadSparringPosts() {
  if (!_fbDb) return;
  _fbDb.collection('community_posts').where('type', '==', 'sparring').orderBy('createdAt', 'desc').limit(20).get()
    .then(function(snap) {
      var list = document.getElementById('cm-sparring-list');
      var empty = document.getElementById('cm-sparring-empty');
      if (!list) return;
      if (snap.size === 0) { if (empty) empty.style.display = 'block'; return; }
      if (empty) empty.style.display = 'none';
      list.innerHTML = snap.docs.map(function(d) {
        var p = d.data();
        return '<div class="cm-sparring-card">' +
          '<div class="cm-sparring-card-header">' +
            communityAuthorHTML(p.authorName, p.authorWeight, p.authorExp, false, p.uid) +
            '<span class="cm-time">' + timeAgo(p.createdAt) + '</span>' +
          '</div>' +
          (p.title ? '<div class="cm-sparring-card-title">' + p.title + '</div>' : '') +
          '<div class="cm-sparring-card-body">' + (p.body || '').replace(/\n/g, '<br>') + '</div>' +
        '</div>';
      }).join('');
    }).catch(function() {
      var empty = document.getElementById('cm-sparring-empty');
      if (empty) empty.style.display = 'block';
    });
}

function openSparringModal() {
  // Reuse create post modal with sparring type pre-selected
  openCreatePostModal();
  setTimeout(function() {
    var sparBtn = document.querySelectorAll('.cm-post-type')[3]; // sparring button
    if (sparBtn) selectPostType(sparBtn, 'sparring');
  }, 100);
}
function filterSparring() { loadSparringPosts(); }

// ===== RANKING TAB =====
function renderRankingTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;
  content.innerHTML =
    '<div class="cm-ranking-header">' +
      '<div class="cm-ranking-title">FIGHTER RANKING</div>' +
      '<div class="cm-ranking-sub">Die aktivsten Mitglieder der Community</div>' +
    '</div>' +
    '<div id="cm-ranking-list" class="cm-ranking-list">' +
      '<div class="cm-loading"><div class="cm-spinner"></div>Lädt Ranking...</div>' +
    '</div>';

  loadRanking();
}

function loadRanking() {
  if (!_fbDb) return;
  // Get recent posts, count by author
  _fbDb.collection('community_posts').orderBy('createdAt', 'desc').limit(100).get()
    .then(function(snap) {
      var authors = {};
      snap.docs.forEach(function(d) {
        var data = d.data();
        var uid = data.uid;
        if (!authors[uid]) {
          authors[uid] = { uid: uid, name: data.authorName, weight: data.authorWeight, exp: data.authorExp, posts: 0, likes: 0 };
        }
        authors[uid].posts++;
        authors[uid].likes += (data.likeCount || 0);
      });

      var sorted = Object.values(authors).sort(function(a, b) { return (b.posts + b.likes) - (a.posts + a.likes); }).slice(0, 20);
      var list = document.getElementById('cm-ranking-list');
      if (!list) return;

      if (sorted.length === 0) {
        list.innerHTML = '<div class="cm-empty"><div class="cm-empty-icon">&#127942;</div><div class="cm-empty-title">Noch kein Ranking</div><div class="cm-empty-text">Werde aktiv und sei der Erste im Ranking!</div></div>';
        return;
      }

      list.innerHTML = sorted.map(function(a, i) {
        var medal = i === 0 ? '<span class="cm-medal cm-gold">&#129351;</span>' : (i === 1 ? '<span class="cm-medal cm-silver">&#129352;</span>' : (i === 2 ? '<span class="cm-medal cm-bronze">&#129353;</span>' : '<span class="cm-rank-num">' + (i + 1) + '</span>'));
        return '<div class="cm-ranking-row' + (i < 3 ? ' cm-ranking-top' : '') + '" onclick="viewPublicProfile(\'' + a.uid + '\')">' +
          '<div class="cm-ranking-pos">' + medal + '</div>' +
          '<div class="cm-ranking-avatar">' + (a.name ? a.name.charAt(0).toUpperCase() : '?') + '</div>' +
          '<div class="cm-ranking-info">' +
            '<div class="cm-ranking-name">' + (a.name || 'Anonym') + (a.weight ? ' <span class="cm-weight-badge">' + a.weight + 'kg</span>' : '') + '</div>' +
            '<div class="cm-ranking-stats">' + a.posts + ' Posts &middot; ' + a.likes + ' Likes</div>' +
          '</div>' +
          '<div class="cm-ranking-score">' + (a.posts + a.likes) + '<span>Punkte</span></div>' +
        '</div>';
      }).join('');
    });
}

// ===== THREAD DETAIL =====
function openThread(threadId) {
  if (!_fbDb) return;
  var el = document.getElementById('page-community-thread');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;"><div class="cm-loading"><div class="cm-spinner"></div>Lädt Thread...</div></div>';
  showPage('community-thread');

  _fbDb.collection('community_threads').doc(threadId).get().then(function(doc) {
    if (!doc.exists) { showToast('Thread nicht gefunden', 'error'); showPage('community'); return; }
    var t = Object.assign({ id: doc.id }, doc.data());
    renderThreadDetail(t);
    loadReplies(threadId);
  });
}

function renderThreadDetail(t) {
  var el = document.getElementById('page-community-thread');
  if (!el) return;
  var cat = _forumCategories.find(function(c) { return c.id === t.category; }) || { icon: '&#128172;', label: 'TALK', color: '#6b6b80' };
  var myUid = _fbUser ? _fbUser.uid : '';

  el.innerHTML =
    '<div class="cm-thread-page">' +
      '<button onclick="showPage(\'community\');switchCommunityTab(\'forum\')" class="cm-back-btn">&larr; Forum</button>' +
      '<span class="cm-cat-badge" style="background:' + cat.color + '18;color:' + cat.color + ';border-color:' + cat.color + '33;">' + cat.icon + ' ' + cat.label + '</span>' +
      '<h2 class="cm-thread-page-title">' + (t.title || '') + '</h2>' +
      '<div class="cm-thread-page-author">' +
        communityAuthorHTML(t.authorName, '', '', t.authorVerified, t.uid) +
        '<span class="cm-time">' + timeAgo(t.createdAt) + '</span>' +
      '</div>' +
      '<div class="cm-thread-page-body">' + (t.body || '').replace(/\n/g, '<br>') + '</div>' +
      (t.mediaUrl ? '<div class="cm-card-media"><img src="' + t.mediaUrl + '" alt="Thread media" loading="lazy"></div>' : '') +
      (t.uid === myUid ? '<button class="cm-delete-thread" onclick="deleteThread(\'' + t.id + '\')">Thread löschen</button>' : '') +
      '<div class="cm-reply-divider"><span>' + (t.replyCount || 0) + ' Antworten</span></div>' +
      '<div class="cm-reply-form">' +
        '<textarea id="reply-input-' + t.id + '" placeholder="Deine Antwort..." class="cm-textarea" rows="3"></textarea>' +
        '<button onclick="submitReply(\'' + t.id + '\', null)" class="cm-submit-btn cm-reply-submit">Antworten</button>' +
      '</div>' +
      '<div id="cm-replies-' + t.id + '"></div>' +
    '</div>';
}

function loadReplies(threadId) {
  var container = document.getElementById('cm-replies-' + threadId);
  if (!container || !_fbDb) return;
  container.innerHTML = '<div class="cm-loading cm-loading-sm"><div class="cm-spinner-sm"></div></div>';

  _fbDb.collection('community_threads').doc(threadId).collection('replies')
    .orderBy('createdAt', 'asc').limit(100).get()
    .then(function(snap) {
      var replies = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      var tree = buildReplyTree(replies);
      container.innerHTML = '';
      renderReplyTree(tree, container, threadId, 0);
      if (replies.length === 0) container.innerHTML = '<div class="cm-empty-small">Noch keine Antworten. Sei der Erste!</div>';
    });
}

function buildReplyTree(replies) {
  var map = {};
  var roots = [];
  replies.forEach(function(r) { map[r.id] = Object.assign(r, { children: [] }); });
  replies.forEach(function(r) {
    if (r.parentReplyId && map[r.parentReplyId]) { map[r.parentReplyId].children.push(r); }
    else { roots.push(r); }
  });
  return roots;
}

function renderReplyTree(nodes, container, threadId, depth) {
  nodes.forEach(function(r) {
    var myUid = _fbUser ? _fbUser.uid : '';
    var myVote = r.votedBy && r.votedBy[myUid] ? r.votedBy[myUid] : 0;
    var indentClass = depth > 0 ? ' cm-reply-indent-' + Math.min(depth, 2) : '';

    container.insertAdjacentHTML('beforeend',
      '<div class="cm-reply' + indentClass + '" id="reply-' + r.id + '">' +
        '<div class="cm-reply-vote">' +
          '<button class="cm-vote-btn' + (myVote === 1 ? ' active-up' : '') + '" onclick="voteReply(\'' + threadId + '\',\'' + r.id + '\',1)">&#9650;</button>' +
          '<span class="cm-vote-num">' + (r.voteScore || 0) + '</span>' +
          '<button class="cm-vote-btn' + (myVote === -1 ? ' active-down' : '') + '" onclick="voteReply(\'' + threadId + '\',\'' + r.id + '\',-1)">&#9660;</button>' +
        '</div>' +
        '<div class="cm-reply-body">' +
          '<div class="cm-reply-header">' +
            '<strong>' + (r.authorName || 'Anonym') + '</strong>' +
            (r.authorVerified ? '<span class="cm-verified">&#10003;</span>' : '') +
            '<span class="cm-time">' + timeAgo(r.createdAt) + '</span>' +
          '</div>' +
          '<div class="cm-reply-text">' + (r.body || '').replace(/\n/g, '<br>') + '</div>' +
          (depth < 2 ? '<button class="cm-reply-btn" onclick="showReplyForm(\'' + threadId + '\',\'' + r.id + '\')">Antworten</button>' : '') +
          '<div id="reply-form-' + r.id + '" style="display:none;" class="cm-nested-reply-form">' +
            '<textarea id="reply-input-' + r.id + '" placeholder="Antwort..." class="cm-textarea cm-textarea-sm" rows="2"></textarea>' +
            '<button onclick="submitReply(\'' + threadId + '\',\'' + r.id + '\')" class="cm-submit-btn cm-reply-submit-sm">Senden</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    if (r.children && r.children.length) {
      renderReplyTree(r.children, container, threadId, depth + 1);
    }
  });
}

function showReplyForm(threadId, replyId) {
  var form = document.getElementById('reply-form-' + replyId);
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function submitReply(threadId, parentReplyId) {
  var inputId = parentReplyId ? 'reply-input-' + parentReplyId : 'reply-input-' + threadId;
  var input = document.getElementById(inputId);
  if (!input || !input.value.trim() || !_fbUser || !_fbDb) return;
  var body = input.value.trim();
  input.value = '';

  var users = safeParse('fos_users', {});
  var u = users[currentUser] || {};
  var depth = 0;
  if (parentReplyId) {
    var parentEl = document.getElementById('reply-' + parentReplyId);
    if (parentEl && parentEl.classList.contains('cm-reply-indent-1')) depth = 2;
    else depth = 1;
  }

  _fbDb.collection('community_threads').doc(threadId).collection('replies').add({
    uid: _fbUser.uid, authorName: u.nickname || currentUser, authorVerified: false,
    body: body, parentReplyId: parentReplyId || null, depth: depth,
    voteScore: 0, votedBy: {}, createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    _fbDb.collection('community_threads').doc(threadId).update({
      replyCount: firebase.firestore.FieldValue.increment(1),
      lastReplyAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    loadReplies(threadId);
  });
}

function voteReply(threadId, replyId, direction) {
  if (!_fbUser || !_fbDb) return;
  var myUid = _fbUser.uid;
  var ref = _fbDb.collection('community_threads').doc(threadId).collection('replies').doc(replyId);

  ref.get().then(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    var currentVote = (data.votedBy && data.votedBy[myUid]) || 0;
    var scoreDiff = 0;
    var newVote = 0;

    if (currentVote === direction) { newVote = 0; scoreDiff = -direction; }
    else { newVote = direction; scoreDiff = direction - currentVote; }

    var update = { voteScore: firebase.firestore.FieldValue.increment(scoreDiff) };
    update['votedBy.' + myUid] = newVote === 0 ? firebase.firestore.FieldValue.delete() : newVote;
    ref.update(update);

    var el = document.getElementById('reply-' + replyId);
    if (el) {
      var num = el.querySelector('.cm-vote-num');
      if (num) num.textContent = (parseInt(num.textContent) || 0) + scoreDiff;
      var ups = el.querySelectorAll('.cm-vote-btn');
      if (ups[0]) ups[0].className = 'cm-vote-btn' + (newVote === 1 ? ' active-up' : '');
      if (ups[1]) ups[1].className = 'cm-vote-btn' + (newVote === -1 ? ' active-down' : '');
    }
  });
}

// ===== CREATE THREAD =====
function openCreateThreadModal() {
  var existing = document.getElementById('cm-thread-modal');
  if (existing) { existing.classList.add('active'); return; }

  var modal = document.createElement('div');
  modal.id = 'cm-thread-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML =
    '<div class="modal cm-modal">' +
      '<div class="modal-header">' +
        '<div class="modal-title">NEUER THREAD</div>' +
        '<button class="modal-close" onclick="document.getElementById(\'cm-thread-modal\').classList.remove(\'active\')">&times;</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="cm-forum-categories cm-thread-cat-select">' +
          _forumCategories.filter(function(c) { return c.id !== 'alle'; }).map(function(c) {
            return '<button class="cm-forum-cat-card' + (c.id === 'technik' ? ' active' : '') + '" onclick="selectThreadCat(this,\'' + c.id + '\')" style="--cat-color:' + c.color + ';">' +
              '<span class="cm-forum-cat-icon">' + c.icon + '</span>' +
              '<span class="cm-forum-cat-label">' + c.label + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<input type="hidden" id="cm-thread-cat" value="technik">' +
        '<input type="text" id="cm-thread-title" placeholder="Thread-Titel" class="cm-input">' +
        '<textarea id="cm-thread-body" placeholder="Beschreibe dein Thema..." class="cm-textarea" rows="5"></textarea>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="cm-submit-btn" onclick="submitThread()">&#10148; Thread erstellen</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function selectThreadCat(btn, cat) {
  btn.parentElement.querySelectorAll('.cm-forum-cat-card').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('cm-thread-cat').value = cat;
}

function submitThread() {
  if (!_fbUser || !_fbDb) { showToast('Bitte einloggen', 'error'); return; }
  var title = document.getElementById('cm-thread-title').value.trim();
  var body = document.getElementById('cm-thread-body').value.trim();
  var cat = document.getElementById('cm-thread-cat').value;
  if (!title) { showToast('Titel eingeben', 'error'); return; }

  var users = safeParse('fos_users', {});
  var u = users[currentUser] || {};

  _fbDb.collection('community_threads').add({
    uid: _fbUser.uid, authorName: u.nickname || currentUser, authorVerified: false,
    category: cat, title: title, body: body, mediaUrl: '',
    replyCount: 0, voteScore: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastReplyAt: firebase.firestore.FieldValue.serverTimestamp(),
    pinned: false
  }).then(function() {
    showToast('Thread erstellt!', 'success');
    document.getElementById('cm-thread-modal').classList.remove('active');
    _forumLastDoc = null;
    loadThreads(true);
  });
}

function deleteThread(threadId) {
  if (!confirm('Thread wirklich löschen?')) return;
  _fbDb.collection('community_threads').doc(threadId).delete().then(function() {
    showToast('Thread gelöscht', 'success');
    showPage('community');
  });
}

// ===== MY PROFILE TAB =====
function renderMyProfileTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;

  // Fallback if Firebase not ready
  if (!_fbDb || !_fbUser) {
    var users = safeParse('fos_users', {});
    var u = users[currentUser] || {};
    renderProfileForm(content, {
      displayName: u.nickname || currentUser,
      weight: u.weight || '', experience: u.experienceLevel || '',
      gym: '', record: { wins: 0, losses: 0, draws: 0 }, bio: '', avatarUrl: ''
    });
    return;
  }

  content.innerHTML = '<div class="cm-loading"><div class="cm-spinner"></div>Lädt Profil...</div>';

  _fbDb.collection('users').doc(_fbUser.uid).get().then(function(doc) {
    var pp = (doc.exists && doc.data() && doc.data().publicProfile) || {};
    var users = safeParse('fos_users', {});
    var u = users[currentUser] || {};
    // Merge local data as fallback
    if (!pp.displayName) pp.displayName = u.nickname || currentUser;
    if (!pp.weight) pp.weight = u.weight || '';
    if (!pp.experience) pp.experience = u.experienceLevel || '';
    renderProfileForm(content, pp);
  }).catch(function(err) {
    console.error('Profile load error:', err);
    var users = safeParse('fos_users', {});
    var u = users[currentUser] || {};
    renderProfileForm(content, {
      displayName: u.nickname || currentUser,
      weight: u.weight || '', experience: u.experienceLevel || '',
      gym: '', record: { wins: 0, losses: 0, draws: 0 }, bio: '', avatarUrl: ''
    });
  });
}

function renderProfileForm(content, pp) {
  var rec = pp.record || { wins: 0, losses: 0, draws: 0 };
  var avatarHTML = pp.avatarUrl ?
    '<img src="' + pp.avatarUrl + '" class="cm-avatar-large-img">' :
    '<div class="cm-avatar-large">' + ((pp.displayName || '?').charAt(0).toUpperCase()) + '</div>';

  content.innerHTML =
    '<div class="cm-profile-edit">' +
      '<div class="cm-profile-card">' +
        '<div class="cm-profile-avatar-section">' +
          avatarHTML +
          '<label class="cm-file-label cm-avatar-upload-btn">' +
            '<input type="file" accept="image/*" onchange="uploadAvatar(this)" style="display:none;">' +
            '<span>Bild ändern</span>' +
          '</label>' +
        '</div>' +
        '<div class="cm-profile-record-bar">' +
          '<div class="cm-profile-rec-item"><span class="cm-rec-num" style="color:#22C55E;">' + rec.wins + '</span><span class="cm-rec-label">S</span></div>' +
          '<div class="cm-profile-rec-item"><span class="cm-rec-num" style="color:#E8000D;">' + rec.losses + '</span><span class="cm-rec-label">N</span></div>' +
          '<div class="cm-profile-rec-item"><span class="cm-rec-num" style="color:#6b6b80;">' + rec.draws + '</span><span class="cm-rec-label">U</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="cm-profile-fields">' +
        '<label>Anzeigename</label>' +
        '<input type="text" id="pp-name" value="' + (pp.displayName || '') + '" class="cm-input">' +
        '<label>Gewichtsklasse (kg)</label>' +
        '<input type="text" id="pp-weight" value="' + (pp.weight || '') + '" class="cm-input">' +
        '<label>Gym / Verein</label>' +
        '<input type="text" id="pp-gym" value="' + (pp.gym || '') + '" class="cm-input">' +
        '<label>Erfahrung</label>' +
        '<select id="pp-exp" class="cm-input">' +
          '<option value="anfaenger"' + (pp.experience === 'anfaenger' ? ' selected' : '') + '>Anfänger</option>' +
          '<option value="fortgeschritten"' + (pp.experience === 'fortgeschritten' ? ' selected' : '') + '>Fortgeschritten</option>' +
          '<option value="wettkampf"' + (pp.experience === 'wettkampf' ? ' selected' : '') + '>Wettkämpfer</option>' +
          '<option value="profi"' + (pp.experience === 'profi' ? ' selected' : '') + '>Profi</option>' +
        '</select>' +
        '<label>Kampfrekord</label>' +
        '<div style="display:flex;gap:8px;">' +
          '<div class="cm-record-input"><input type="number" id="pp-wins" value="' + rec.wins + '" class="cm-input" min="0"><span>Siege</span></div>' +
          '<div class="cm-record-input"><input type="number" id="pp-losses" value="' + rec.losses + '" class="cm-input" min="0"><span>Ndl.</span></div>' +
          '<div class="cm-record-input"><input type="number" id="pp-draws" value="' + rec.draws + '" class="cm-input" min="0"><span>Unent.</span></div>' +
        '</div>' +
        '<label>Bio</label>' +
        '<textarea id="pp-bio" class="cm-textarea" rows="3" placeholder="Erzähl etwas über dich...">' + (pp.bio || '') + '</textarea>' +
        '<button class="cm-submit-btn" onclick="savePublicProfile()" style="margin-top:16px;">Profil speichern</button>' +
      '</div>' +
    '</div>';
}

function savePublicProfile() {
  if (!_fbUser || !_fbDb) { showToast('Nicht eingeloggt', 'error'); return; }
  var profile = {
    displayName: document.getElementById('pp-name').value.trim() || currentUser,
    weight: document.getElementById('pp-weight').value.trim(),
    gym: document.getElementById('pp-gym').value.trim(),
    experience: document.getElementById('pp-exp').value,
    record: {
      wins: parseInt(document.getElementById('pp-wins').value) || 0,
      losses: parseInt(document.getElementById('pp-losses').value) || 0,
      draws: parseInt(document.getElementById('pp-draws').value) || 0
    },
    bio: document.getElementById('pp-bio').value.trim()
  };

  _fbDb.collection('users').doc(_fbUser.uid).set({ publicProfile: profile }, { merge: true })
    .then(function() { showToast('Profil gespeichert!', 'success'); })
    .catch(function(err) { showToast('Fehler: ' + err.message, 'error'); });
}

function uploadAvatar(input) {
  if (!input.files[0] || !_fbUser) return;
  var path = 'avatars/' + _fbUser.uid + '.jpg';
  uploadMedia(input.files[0], path, null, function(url) {
    if (!url) return;
    _fbDb.collection('users').doc(_fbUser.uid).set({ publicProfile: { avatarUrl: url } }, { merge: true })
      .then(function() { showToast('Avatar aktualisiert!', 'success'); renderMyProfileTab(); });
  });
}

// ===== VIEW PUBLIC PROFILE =====
function viewPublicProfile(uid) {
  if (!_fbDb) return;
  var el = document.getElementById('page-community-profile');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;"><div class="cm-loading"><div class="cm-spinner"></div>Lädt Profil...</div></div>';
  showPage('community-profile');

  _fbDb.collection('users').doc(uid).get().then(function(doc) {
    if (!doc.exists) { showToast('Profil nicht gefunden', 'error'); showPage('community'); return; }
    var pp = (doc.data() && doc.data().publicProfile) || {};
    var rec = pp.record || { wins: 0, losses: 0, draws: 0 };

    el.innerHTML =
      '<div class="cm-thread-page">' +
        '<button onclick="showPage(\'community\')" class="cm-back-btn">&larr; Zurück</button>' +
        '<div class="cm-public-profile">' +
          (pp.avatarUrl ? '<img src="' + pp.avatarUrl + '" class="cm-avatar-large-img" style="margin:0 auto 16px;display:block;">' :
            '<div class="cm-avatar-large" style="margin:0 auto 16px;">' + ((pp.displayName || '?').charAt(0).toUpperCase()) + '</div>') +
          '<h2 class="cm-profile-name">' + (pp.displayName || 'Unbekannt') +
            (pp.isTrainer ? '<span class="cm-verified">&#10003;</span>' : '') + '</h2>' +
          '<div class="cm-profile-stats">' +
            (pp.weight ? '<span class="cm-weight-badge">' + pp.weight + 'kg</span>' : '') +
            (pp.experience ? '<span class="cm-exp-badge">' + pp.experience + '</span>' : '') +
            (pp.gym ? '<span class="cm-gym-badge">' + pp.gym + '</span>' : '') +
          '</div>' +
          '<div class="cm-profile-record">' +
            '<div class="cm-record-item"><span class="cm-record-num" style="color:#22C55E;">' + rec.wins + '</span><span class="cm-record-label">Siege</span></div>' +
            '<div class="cm-record-item"><span class="cm-record-num" style="color:#E8000D;">' + rec.losses + '</span><span class="cm-record-label">Ndl.</span></div>' +
            '<div class="cm-record-item"><span class="cm-record-num" style="color:#6b6b80;">' + rec.draws + '</span><span class="cm-record-label">Unent.</span></div>' +
          '</div>' +
          (pp.bio ? '<div class="cm-profile-bio">' + pp.bio.replace(/\n/g, '<br>') + '</div>' : '') +
        '</div>' +
      '</div>';
  }).catch(function() { showToast('Fehler beim Laden', 'error'); showPage('community'); });
}
