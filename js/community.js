/* ============================================
   BOXSPEC – COMMUNITY
   Feed, Forum (Reddit-style), Public Profiles
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

  el.innerHTML =
    '<div class="page-header">' +
      '<div class="page-title">COMM<span>UNITY</span></div>' +
      '<div class="page-sub">Teile, diskutiere, werde besser.</div>' +
    '</div>' +
    '<div class="cm-tabs">' +
      '<button class="cm-tab' + (tab === 'feed' ? ' active' : '') + '" onclick="switchCommunityTab(\'feed\')">FEED</button>' +
      '<button class="cm-tab' + (tab === 'forum' ? ' active' : '') + '" onclick="switchCommunityTab(\'forum\')">FORUM</button>' +
      '<button class="cm-tab' + (tab === 'profil' ? ' active' : '') + '" onclick="switchCommunityTab(\'profil\')">MEIN PROFIL</button>' +
    '</div>' +
    '<div id="cm-content"></div>';

  switchCommunityTab(tab);
}

function switchCommunityTab(tab) {
  _communityTab = tab;
  document.querySelectorAll('.cm-tab').forEach(function(b) { b.classList.remove('active'); });
  var active = document.querySelector('.cm-tab[onclick*="' + tab + '"]');
  if (active) active.classList.add('active');

  if (tab === 'feed') renderFeedTab();
  else if (tab === 'forum') renderForumTab();
  else if (tab === 'profil') renderMyProfileTab();
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

function communityAuthorHTML(name, weight, exp, verified, uid) {
  var badge = verified ? '<span class="cm-verified" title="Verifizierter Trainer">&#10003;</span>' : '';
  var weightBadge = weight ? '<span class="cm-weight-badge">' + weight + 'kg</span>' : '';
  var click = uid ? ' onclick="viewPublicProfile(\'' + uid + '\')" style="cursor:pointer;"' : '';
  return '<div class="cm-author"' + click + '>' +
    '<div class="cm-avatar">' + (name ? name.charAt(0).toUpperCase() : '?') + '</div>' +
    '<div class="cm-author-info">' +
      '<div class="cm-author-name">' + (name || 'Anonym') + badge + ' ' + weightBadge + '</div>' +
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
      function() {
        task.snapshot.ref.getDownloadURL().then(function(url) { callback(url); });
      }
    );
  }

  if (file.type.startsWith('image/')) {
    compressImage(file, 1200, 0.8, function(blob) { doUpload(blob); });
  } else if (file.type.startsWith('video/')) {
    if (file.size > 50 * 1024 * 1024) {
      showToast('Video max. 50MB', 'error'); callback(null); return;
    }
    doUpload(file);
  } else {
    doUpload(file);
  }
}

// ===== PUBLIC PROFILE INIT =====
function ensurePublicProfile() {
  if (!_fbUser || !_fbDb) return;
  var data = getData();
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
}

// ===== FEED TAB =====
function renderFeedTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;
  content.innerHTML =
    '<div class="cm-feed-actions">' +
      '<button class="cm-create-btn" onclick="openCreatePostModal()">+ Beitrag erstellen</button>' +
    '</div>' +
    '<div id="cm-feed-list"></div>' +
    '<div id="cm-feed-sentinel" style="height:1px;"></div>' +
    '<div id="cm-feed-loading" class="cm-loading" style="display:none;">Lädt...</div>' +
    '<div id="cm-feed-empty" style="display:none;" class="cm-empty">Noch keine Beiträge. Sei der Erste!</div>';

  _feedLastDoc = null;
  loadFeedPosts(true);
  setupFeedObserver();
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
  if (_feedLoading) return;
  if (!_fbDb) return;
  _feedLoading = true;
  var loadingEl = document.getElementById('cm-feed-loading');
  if (loadingEl) loadingEl.style.display = 'block';

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
  });
}

function renderFeedPosts(posts, reset) {
  var list = document.getElementById('cm-feed-list');
  if (!list) return;
  if (reset) list.innerHTML = '';

  posts.forEach(function(post) {
    list.insertAdjacentHTML('beforeend', renderFeedCard(post));
  });
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
  var typeLabel = '';
  if (post.type === 'fight_result') typeLabel = '<span class="cm-type-badge cm-type-fight">KAMPFERGEBNIS</span>';
  else if (post.type === 'analysis_request') typeLabel = '<span class="cm-type-badge cm-type-analysis">ANALYSE</span>';
  else if (post.type === 'sparring') typeLabel = '<span class="cm-type-badge cm-type-sparring">SPARRING</span>';

  return '<div class="cm-card" id="post-' + post.id + '">' +
    '<div class="cm-card-header">' +
      communityAuthorHTML(post.authorName, post.authorWeight, post.authorExp, post.authorVerified, post.uid) +
      '<span class="cm-time">' + timeAgo(post.createdAt) + '</span>' +
    '</div>' +
    typeLabel +
    (post.title ? '<div class="cm-card-title">' + post.title + '</div>' : '') +
    '<div class="cm-card-body">' + (post.body || '').replace(/\n/g, '<br>') + '</div>' +
    mediaHTML +
    '<div class="cm-card-actions">' +
      '<button class="cm-action-btn' + (liked ? ' liked' : '') + '" onclick="toggleLike(\'' + post.id + '\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (liked ? 'var(--red)' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '<span>' + (post.likeCount || 0) + '</span>' +
      '</button>' +
      '<button class="cm-action-btn" onclick="toggleComments(\'' + post.id + '\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<span>' + (post.commentCount || 0) + '</span>' +
      '</button>' +
      (post.uid === myUid ? '<button class="cm-action-btn cm-delete" onclick="deletePost(\'' + post.id + '\')">Löschen</button>' : '') +
    '</div>' +
    '<div class="cm-comments" id="comments-' + post.id + '" style="display:none;"></div>' +
  '</div>';
}

// ===== LIKES =====
function toggleLike(postId) {
  if (!_fbUser || !_fbDb) return;
  var ref = _fbDb.collection('community_posts').doc(postId);
  var myUid = _fbUser.uid;

  // Optimistic UI
  var card = document.getElementById('post-' + postId);
  if (!card) return;
  var likeBtn = card.querySelector('.cm-action-btn');
  var isLiked = likeBtn.classList.contains('liked');

  if (isLiked) {
    likeBtn.classList.remove('liked');
    likeBtn.querySelector('svg').setAttribute('fill', 'none');
    var count = parseInt(likeBtn.querySelector('span').textContent) || 0;
    likeBtn.querySelector('span').textContent = Math.max(0, count - 1);
    ref.update({
      likedBy: firebase.firestore.FieldValue.arrayRemove(myUid),
      likeCount: firebase.firestore.FieldValue.increment(-1)
    });
  } else {
    likeBtn.classList.add('liked');
    likeBtn.querySelector('svg').setAttribute('fill', 'var(--red)');
    var count2 = parseInt(likeBtn.querySelector('span').textContent) || 0;
    likeBtn.querySelector('span').textContent = count2 + 1;
    ref.update({
      likedBy: firebase.firestore.FieldValue.arrayUnion(myUid),
      likeCount: firebase.firestore.FieldValue.increment(1)
    });
  }
}

// ===== COMMENTS =====
function toggleComments(postId) {
  var el = document.getElementById('comments-' + postId);
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = 'block';
    loadComments(postId);
  } else {
    el.style.display = 'none';
  }
}

function loadComments(postId) {
  var el = document.getElementById('comments-' + postId);
  if (!el || !_fbDb) return;
  el.innerHTML = '<div class="cm-loading">Lädt Kommentare...</div>';

  _fbDb.collection('community_posts').doc(postId).collection('comments')
    .orderBy('createdAt', 'asc').limit(50).get()
    .then(function(snap) {
      var comments = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      el.innerHTML = comments.map(function(c) {
        return '<div class="cm-comment">' +
          '<div class="cm-comment-header">' +
            '<strong>' + (c.authorName || 'Anonym') + '</strong>' +
            '<span class="cm-time">' + timeAgo(c.createdAt) + '</span>' +
          '</div>' +
          '<div class="cm-comment-body">' + (c.body || '').replace(/\n/g, '<br>') + '</div>' +
        '</div>';
      }).join('') +
      '<div class="cm-comment-form">' +
        '<input type="text" id="comment-input-' + postId + '" placeholder="Kommentar schreiben..." class="cm-comment-input">' +
        '<button onclick="submitComment(\'' + postId + '\')" class="cm-comment-submit">&#10148;</button>' +
      '</div>';
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
    uid: _fbUser.uid,
    authorName: u.nickname || currentUser,
    body: body,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    _fbDb.collection('community_posts').doc(postId).update({
      commentCount: firebase.firestore.FieldValue.increment(1)
    });
    loadComments(postId);
    // Update count in card
    var card = document.getElementById('post-' + postId);
    if (card) {
      var btns = card.querySelectorAll('.cm-action-btn');
      if (btns[1]) {
        var cnt = parseInt(btns[1].querySelector('span').textContent) || 0;
        btns[1].querySelector('span').textContent = cnt + 1;
      }
    }
  });
}

// ===== CREATE POST =====
function openCreatePostModal() {
  var overlay = document.getElementById('cm-post-modal');
  if (overlay) { overlay.classList.add('active'); return; }

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
          '<button class="cm-post-type active" onclick="selectPostType(this,\'text\')">Text</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'image\')">Bild</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'video\')">Video</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'sparring\')">Sparring</button>' +
          '<button class="cm-post-type" onclick="selectPostType(this,\'analysis_request\')">Analyse</button>' +
        '</div>' +
        '<input type="hidden" id="cm-post-type" value="text">' +
        '<input type="text" id="cm-post-title" placeholder="Titel (optional)" class="cm-input" style="display:none;">' +
        '<textarea id="cm-post-body" placeholder="Was möchtest du teilen?" class="cm-textarea" rows="4"></textarea>' +
        '<div id="cm-media-section" style="display:none;">' +
          '<label class="cm-file-label">' +
            '<input type="file" id="cm-post-file" accept="image/*,video/*" onchange="previewPostMedia(this)" style="display:none;">' +
            '<span>Datei auswählen</span>' +
          '</label>' +
          '<div id="cm-media-preview"></div>' +
          '<div class="cm-progress-bar"><div id="cm-upload-progress" class="cm-progress-fill"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="cm-submit-btn" onclick="submitFeedPost()">Posten</button>' +
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
  if (type === 'image' || type === 'video' || type === 'analysis_request') {
    mediaSection.style.display = 'block';
  } else {
    mediaSection.style.display = 'none';
  }
  if (type === 'analysis_request' || type === 'sparring') {
    titleInput.style.display = 'block';
  } else {
    titleInput.style.display = 'none';
  }
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
    uid: _fbUser.uid,
    authorName: u.nickname || currentUser,
    authorWeight: u.weight || '',
    authorExp: u.experienceLevel || '',
    authorVerified: false,
    type: type,
    title: title,
    body: body,
    mediaUrl: '',
    likeCount: 0,
    commentCount: 0,
    likedBy: [],
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
  } else {
    savePost(postData);
  }
}

function savePost(postData) {
  _fbDb.collection('community_posts').add(postData).then(function() {
    showToast('Gepostet!', 'success');
    closeCreatePostModal();
    _feedLastDoc = null;
    loadFeedPosts(true);
  }).catch(function(err) {
    showToast('Fehler: ' + err.message, 'error');
  });
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
  { id: 'alle', label: 'ALLE' },
  { id: 'technik', label: 'TECHNIK' },
  { id: 'ernaehrung', label: 'ERNÄHRUNG' },
  { id: 'kampf', label: 'KAMPF' },
  { id: 'training', label: 'TRAINING' },
  { id: 'allgemein', label: 'ALLGEMEIN' }
];

function renderForumTab() {
  var content = document.getElementById('cm-content');
  if (!content) return;
  content.innerHTML =
    '<div class="cm-forum-header">' +
      '<div class="cm-forum-cats">' +
        _forumCategories.map(function(c) {
          return '<button class="cm-cat-pill' + (c.id === _forumCategory ? ' active' : '') + '" onclick="filterForum(\'' + c.id + '\')">' + c.label + '</button>';
        }).join('') +
      '</div>' +
      '<div class="cm-forum-sort">' +
        '<button class="cm-sort-btn' + (_forumSort === 'neu' ? ' active' : '') + '" onclick="sortForum(\'neu\')">Neu</button>' +
        '<button class="cm-sort-btn' + (_forumSort === 'top' ? ' active' : '') + '" onclick="sortForum(\'top\')">Top</button>' +
        '<button class="cm-sort-btn' + (_forumSort === 'aktiv' ? ' active' : '') + '" onclick="sortForum(\'aktiv\')">Aktiv</button>' +
      '</div>' +
    '</div>' +
    '<button class="cm-create-btn cm-create-thread" onclick="openCreateThreadModal()">+ Neuen Thread erstellen</button>' +
    '<div id="cm-forum-list"></div>' +
    '<div id="cm-forum-sentinel" style="height:1px;"></div>' +
    '<div id="cm-forum-loading" class="cm-loading" style="display:none;">Lädt...</div>' +
    '<div id="cm-forum-empty" style="display:none;" class="cm-empty">Noch keine Threads. Starte eine Diskussion!</div>';

  _forumLastDoc = null;
  loadThreads(true);
}

function filterForum(cat) {
  _forumCategory = cat;
  document.querySelectorAll('.cm-cat-pill').forEach(function(b) { b.classList.remove('active'); });
  var active = document.querySelector('.cm-cat-pill[onclick*="' + cat + '"]');
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
  if (loadingEl) loadingEl.style.display = 'block';

  var sortField = _forumSort === 'top' ? 'voteScore' : (_forumSort === 'aktiv' ? 'lastReplyAt' : 'createdAt');
  var q = _fbDb.collection('community_threads').orderBy(sortField, 'desc').limit(FORUM_PAGE_SIZE);

  if (_forumCategory !== 'alle') {
    q = _fbDb.collection('community_threads')
      .where('category', '==', _forumCategory)
      .orderBy(sortField, 'desc')
      .limit(FORUM_PAGE_SIZE);
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
  });
}

function renderThreadList(threads, reset) {
  var list = document.getElementById('cm-forum-list');
  if (!list) return;
  if (reset) list.innerHTML = '';

  threads.forEach(function(t) {
    var catColor = { technik: '#E8000D', ernaehrung: '#22C55E', kampf: '#F97316', training: '#3B82F6', allgemein: '#6b6b80' };
    var color = catColor[t.category] || '#6b6b80';
    list.insertAdjacentHTML('beforeend',
      '<div class="cm-thread-row" onclick="openThread(\'' + t.id + '\')">' +
        '<div class="cm-thread-votes">' +
          '<span class="cm-vote-score">' + (t.voteScore || 0) + '</span>' +
          '<span class="cm-vote-label">Punkte</span>' +
        '</div>' +
        '<div class="cm-thread-content">' +
          '<span class="cm-cat-badge" style="background:' + color + '22;color:' + color + ';border-color:' + color + '44;">' + (t.category || 'allgemein').toUpperCase() + '</span>' +
          '<div class="cm-thread-title">' + (t.title || 'Ohne Titel') + '</div>' +
          '<div class="cm-thread-meta">' +
            '<span>' + (t.authorName || 'Anonym') + '</span>' +
            (t.authorVerified ? '<span class="cm-verified">&#10003;</span>' : '') +
            '<span>' + timeAgo(t.createdAt) + '</span>' +
            '<span>' + (t.replyCount || 0) + ' Antworten</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  });
}

// ===== THREAD DETAIL =====
function openThread(threadId) {
  if (!_fbDb) return;
  // Navigate to thread detail page
  var el = document.getElementById('page-community-thread');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;"><div class="cm-loading">Lädt Thread...</div></div>';
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
  var catColor = { technik: '#E8000D', ernaehrung: '#22C55E', kampf: '#F97316', training: '#3B82F6', allgemein: '#6b6b80' };
  var color = catColor[t.category] || '#6b6b80';
  var myUid = _fbUser ? _fbUser.uid : '';

  el.innerHTML =
    '<div class="cm-thread-page">' +
      '<button onclick="showPage(\'community\')" class="cm-back-btn">&larr; Forum</button>' +
      '<span class="cm-cat-badge" style="background:' + color + '22;color:' + color + ';border-color:' + color + '44;">' + (t.category || 'allgemein').toUpperCase() + '</span>' +
      '<h2 class="cm-thread-page-title">' + (t.title || '') + '</h2>' +
      '<div class="cm-thread-page-author">' +
        communityAuthorHTML(t.authorName, '', '', t.authorVerified, t.uid) +
        '<span class="cm-time">' + timeAgo(t.createdAt) + '</span>' +
      '</div>' +
      '<div class="cm-thread-page-body">' + (t.body || '').replace(/\n/g, '<br>') + '</div>' +
      (t.mediaUrl ? '<div class="cm-card-media"><img src="' + t.mediaUrl + '" alt="Thread media" loading="lazy"></div>' : '') +
      (t.uid === myUid ? '<button class="cm-delete-thread" onclick="deleteThread(\'' + t.id + '\')">Thread löschen</button>' : '') +
      '<div class="cm-reply-divider">' +
        '<span>' + (t.replyCount || 0) + ' Antworten</span>' +
      '</div>' +
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
  container.innerHTML = '<div class="cm-loading">Lädt Antworten...</div>';

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
    if (r.parentReplyId && map[r.parentReplyId]) {
      map[r.parentReplyId].children.push(r);
    } else {
      roots.push(r);
    }
  });
  return roots;
}

function renderReplyTree(nodes, container, threadId, depth) {
  nodes.forEach(function(r) {
    var myUid = _fbUser ? _fbUser.uid : '';
    var myVote = r.votedBy && r.votedBy[myUid] ? r.votedBy[myUid] : 0;
    var indentClass = depth > 0 ? ' cm-reply-indent-' + Math.min(depth, 2) : '';

    var html =
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
      '</div>';

    container.insertAdjacentHTML('beforeend', html);

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
    else if (parentReplyId) depth = 1;
  }

  _fbDb.collection('community_threads').doc(threadId).collection('replies').add({
    uid: _fbUser.uid,
    authorName: u.nickname || currentUser,
    authorVerified: false,
    body: body,
    parentReplyId: parentReplyId || null,
    depth: depth,
    voteScore: 0,
    votedBy: {},
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
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

    if (currentVote === direction) {
      // Remove vote
      newVote = 0;
      scoreDiff = -direction;
    } else {
      // Change or add vote
      newVote = direction;
      scoreDiff = direction - currentVote;
    }

    var update = { voteScore: firebase.firestore.FieldValue.increment(scoreDiff) };
    update['votedBy.' + myUid] = newVote === 0 ? firebase.firestore.FieldValue.delete() : newVote;
    ref.update(update);

    // Optimistic UI
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
        '<div class="cm-forum-cats" style="margin-bottom:16px;">' +
          _forumCategories.filter(function(c) { return c.id !== 'alle'; }).map(function(c) {
            return '<button class="cm-cat-pill' + (c.id === 'technik' ? ' active' : '') + '" onclick="selectThreadCat(this,\'' + c.id + '\')">' + c.label + '</button>';
          }).join('') +
        '</div>' +
        '<input type="hidden" id="cm-thread-cat" value="technik">' +
        '<input type="text" id="cm-thread-title" placeholder="Thread-Titel" class="cm-input">' +
        '<textarea id="cm-thread-body" placeholder="Beschreibe dein Thema..." class="cm-textarea" rows="5"></textarea>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="cm-submit-btn" onclick="submitThread()">Thread erstellen</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function selectThreadCat(btn, cat) {
  btn.parentElement.querySelectorAll('.cm-cat-pill').forEach(function(b) { b.classList.remove('active'); });
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
    uid: _fbUser.uid,
    authorName: u.nickname || currentUser,
    authorVerified: false,
    category: cat,
    title: title,
    body: body,
    mediaUrl: '',
    replyCount: 0,
    voteScore: 0,
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
  if (!content || !_fbDb || !_fbUser) return;
  content.innerHTML = '<div class="cm-loading">Lädt Profil...</div>';

  _fbDb.collection('users').doc(_fbUser.uid).get().then(function(doc) {
    var pp = (doc.exists && doc.data().publicProfile) || {};
    var users = safeParse('fos_users', {});
    var u = users[currentUser] || {};

    content.innerHTML =
      '<div class="cm-profile-edit">' +
        '<div class="cm-profile-avatar-section">' +
          '<div class="cm-avatar-large">' + ((pp.displayName || currentUser).charAt(0).toUpperCase()) + '</div>' +
          '<label class="cm-file-label cm-avatar-upload-btn">' +
            '<input type="file" accept="image/*" onchange="uploadAvatar(this)" style="display:none;">' +
            '<span>Bild ändern</span>' +
          '</label>' +
        '</div>' +
        '<div class="cm-profile-fields">' +
          '<label>Anzeigename</label>' +
          '<input type="text" id="pp-name" value="' + (pp.displayName || u.nickname || currentUser) + '" class="cm-input">' +
          '<label>Gewichtsklasse (kg)</label>' +
          '<input type="text" id="pp-weight" value="' + (pp.weight || u.weight || '') + '" class="cm-input">' +
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
            '<input type="number" id="pp-wins" value="' + ((pp.record && pp.record.wins) || 0) + '" class="cm-input" placeholder="Siege" min="0">' +
            '<input type="number" id="pp-losses" value="' + ((pp.record && pp.record.losses) || 0) + '" class="cm-input" placeholder="Niederlagen" min="0">' +
            '<input type="number" id="pp-draws" value="' + ((pp.record && pp.record.draws) || 0) + '" class="cm-input" placeholder="Unent." min="0">' +
          '</div>' +
          '<label>Bio</label>' +
          '<textarea id="pp-bio" class="cm-textarea" rows="3" placeholder="Erzähl etwas über dich...">' + (pp.bio || '') + '</textarea>' +
          '<button class="cm-submit-btn" onclick="savePublicProfile()" style="margin-top:16px;">Profil speichern</button>' +
        '</div>' +
      '</div>';
  });
}

function savePublicProfile() {
  if (!_fbUser || !_fbDb) return;
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
    _fbDb.collection('users').doc(_fbUser.uid).set({
      publicProfile: { avatarUrl: url }
    }, { merge: true }).then(function() {
      showToast('Avatar aktualisiert!', 'success');
      renderMyProfileTab();
    });
  });
}

// ===== VIEW PUBLIC PROFILE =====
function viewPublicProfile(uid) {
  if (!_fbDb) return;
  var el = document.getElementById('page-community-profile');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;"><div class="cm-loading">Lädt Profil...</div></div>';
  showPage('community-profile');

  _fbDb.collection('users').doc(uid).get().then(function(doc) {
    if (!doc.exists) { showToast('Profil nicht gefunden', 'error'); showPage('community'); return; }
    var pp = doc.data().publicProfile || {};
    var rec = pp.record || { wins: 0, losses: 0, draws: 0 };

    el.innerHTML =
      '<div class="cm-thread-page">' +
        '<button onclick="showPage(\'community\')" class="cm-back-btn">&larr; Zurück</button>' +
        '<div class="cm-public-profile">' +
          '<div class="cm-avatar-large">' + ((pp.displayName || '?').charAt(0).toUpperCase()) + '</div>' +
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
  });
}
