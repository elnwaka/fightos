/* ============================================
   FIGHTOS – Video Library (Wissen)
   Curated boxing knowledge videos
   Custom player UI over YouTube embeds
   ============================================ */

var VIDEO_LIBRARY = [
  // === KAMPF-BREAKDOWNS ===
  {
    category: 'breakdowns',
    categoryLabel: 'KAMPF-BREAKDOWNS',
    categoryDesc: 'Profi-Kämpfe analysiert — verstehe WARUM Boxer gewinnen, nicht nur WER.',
    videos: [
      { id: 'hq7evFpmVek', title: 'Mayweathers unterschätzte Taktiken', desc: 'Ring IQ, Punch Selection und Defense-Strategie des vielleicht smartesten Boxers aller Zeiten.', duration: '15:00', tags: ['Defense','Ring IQ','Taktik'] },
      { id: 'HKU49EclMX8', title: 'Lomachenkos High-Tech-Stil', desc: 'Wie Lomachenko Winkel kreiert und ausnutzt — Stance, Kopfbewegung, Fußarbeit und Guard-Manipulation.', duration: '18:00', tags: ['Winkel','Fußarbeit','Guard'] },
      { id: 'TwHkGZvGZoM', title: 'Usyks System verstehen', desc: 'Das System hinter Usyks Stil — und wie er es trainiert. Vom Cruiser- zum Schwergewicht.', duration: '20:00', tags: ['System','Stil','Taktik'] },
      { id: 'Yc6RaEjDwl8', title: 'Naoya Inoues Killer-Stil', desc: 'Die Skills hinter dem gefährlichsten Bantamgewichtler der Geschichte.', duration: '14:00', tags: ['Power','Timing','Kombis'] },
      { id: 'Ihe9nXXyo1w', title: 'Andre Wards smarte Taktiken', desc: 'Strategien und Taktiken vom ungeschlagenen Supermittelgewichts-Champion.', duration: '16:00', tags: ['Taktik','Clinch','IQ'] },
      { id: 'y1UZRV266B0', title: 'Caleb Plants kreative Techniken', desc: 'Shovel Jab, Shovel Hook, geschmeidige Fußarbeit und Führhand-Kontrolle.', duration: '13:00', tags: ['Jab','Kreativität','Führhand'] },
      { id: 'lly-AuwD-zc', title: 'Subriel Matias — unkonventioneller Stil', desc: 'Warum sein ungewöhnlicher Stil so effektiv funktioniert.', duration: '12:00', tags: ['Druck','Körper','Power'] },
      { id: 'Wlag12lY0U0', title: 'Dmitry Pirog — Schach im Ring', desc: 'Wie ein Großmeister die Fußarbeit benutzt um den Ring zu kontrollieren.', duration: '15:00', tags: ['Fußarbeit','Ring Control','IQ'] }
    ]
  },

  // === RING IQ & TAKTIK ===
  {
    category: 'ringiQ',
    categoryLabel: 'RING IQ & TAKTIK',
    categoryDesc: 'Distanzkontrolle, Timing, Winkel schneiden, Ringschneiden — der mentale Kampf.',
    videos: [
      { id: 'Po3Dwu1Bb30', title: 'Ring abschneiden — Stop den Runner', desc: 'Wie du einen Gegner der wegläuft systematisch einkreist und unter Druck setzt.', duration: '11:00', tags: ['Ring Cut','Druck','Fußarbeit'] },
      { id: 'ONap_xV3ViE', title: 'Der größte Defensiv-Boxer aller Zeiten', desc: 'Pernell Whitakers seidige Fußarbeit und unerreichte defensive Meisterschaft.', duration: '14:00', tags: ['Defense','Fußarbeit','Ring IQ'] },
      { id: 'fWSdk2qeRlY', title: 'Fußarbeit, Defense & Fight IQ Blueprint', desc: 'Kompletter Guide zu den drei Grundpfeilern des intelligenten Boxens.', duration: '45:00', tags: ['Fußarbeit','Defense','IQ'] },
      { id: 'sHIaIDnxXbU', title: 'Den technisch perfekten Boxer bauen', desc: 'Was einen technisch kompletten Boxer ausmacht — und wie du dorthin kommst.', duration: '16:00', tags: ['Technik','Komplett','System'] }
    ]
  },

  // === TECHNIK-TUTORIALS ===
  {
    category: 'technik',
    categoryLabel: 'TECHNIK',
    categoryDesc: 'Es gibt nicht nur einen Weg einen Jab zu schlagen. Verschiedene Stile, verschiedene Lösungen.',
    videos: [
      { id: 'Jg2CgIK8nFk', title: 'Die langweiligen Grundlagen die Boxer stark machen', desc: 'Die Basics die keiner sexy findet aber die den Unterschied machen. Stance, Guard, Gewichtsverlagerung.', duration: '18:00', tags: ['Grundlagen','Stance','Guard'] },
      { id: 'rwAGGeOk4_Q', title: 'Wie Profis wirklich Schattenboxen', desc: 'Schattenboxen ist nicht nur rumschwingen — so machen es die Profis mit System und Absicht.', duration: '12:00', tags: ['Schattenboxen','Routine','Visualisierung'] },
      { id: 'r7MUFC7xA0w', title: '10 Minuten die dein Amateurboxen verbessern', desc: 'Schnelle, sofort umsetzbare Technik-Verbesserungen für Amateurboxer.', duration: '10:00', tags: ['Amateur','Schnell','Umsetzbar'] },
      { id: 'N0U5RPGpjSg', title: '10 Skills die du meistern musst + 3 die du vermeiden sollst', desc: 'Die wichtigsten Boxing-Skills für Anfänger — und welche Gewohnheiten du sofort ablegen musst.', duration: '20:00', tags: ['Anfänger','Skills','Fehler'] }
    ]
  },

  // === S&C FÜR BOXER ===
  {
    category: 'sc',
    categoryLabel: 'KRAFT & CONDITIONING',
    categoryDesc: 'Sportwissenschaft für Boxer — die gleiche Methodik die FightOS nutzt.',
    videos: [
      { id: 'hmFQTjxlE5M', title: 'Die besten Conditioning-Methoden für Boxer (Ranking)', desc: 'Alle Conditioning-Methoden im Vergleich — von Zone 2 bis HIIT bis SIT. Was funktioniert wirklich?', duration: '22:00', tags: ['Conditioning','HIIT','Ranking'] },
      { id: '22zeL5FuCv0', title: 'S&C individualisieren — Kompletter Guide', desc: 'Wie du Kraft- und Konditionstraining an dein Level, deine Schwächen und deinen Kampfkalender anpasst.', duration: '30:00', tags: ['Periodisierung','Individuell','System'] },
      { id: 'DajasFD5ExA', title: 'S&C in die Amateur-Boxing-Routine integrieren', desc: 'Praktischer Guide: Wie du Krafttraining mit deinem Vereinstraining kombinierst ohne dich zu überlasten.', duration: '18:00', tags: ['Amateur','Planung','Integration'] },
      { id: 'QmnpevLGSs4', title: 'Kraft & Power Workout für Boxer', desc: 'Komplettes Workout zum Mitmachen — die Übungen die FightOS im Kraftprogramm nutzt.', duration: '25:00', tags: ['Workout','Kraft','Power'] }
    ]
  }
];

// ===== RENDER VIDEO LIBRARY =====
function renderVideoLibrary() {
  var html = '';

  VIDEO_LIBRARY.forEach(function(cat) {
    html += '<div style="margin-bottom:40px;">' +
      '<div style="margin-bottom:16px;">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:24px;color:var(--white);letter-spacing:2px;">' + cat.categoryLabel + '</div>' +
        '<div style="font-size:13px;color:var(--text-muted);line-height:1.5;">' + cat.categoryDesc + '</div>' +
      '</div>' +
      '<div class="vid-grid">' +
        cat.videos.map(function(v) {
          return '<div class="vid-card" onclick="openVideoPlayer(\'' + v.id + '\',\'' + escapeHTML(v.title).replace(/'/g,'') + '\')">' +
            '<div class="vid-thumb">' +
              '<img src="https://img.youtube.com/vi/' + v.id + '/mqdefault.jpg" alt="" loading="lazy">' +
              '<div class="vid-play-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>' +
              '<div class="vid-duration">' + v.duration + '</div>' +
            '</div>' +
            '<div class="vid-info">' +
              '<div class="vid-title">' + v.title + '</div>' +
              '<div class="vid-desc">' + v.desc + '</div>' +
              '<div class="vid-tags">' + v.tags.map(function(t) { return '<span class="vid-tag">' + t + '</span>'; }).join('') + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  });

  return html;
}

// ===== CUSTOM VIDEO PLAYER (fullscreen overlay, no YT branding) =====
function openVideoPlayer(videoId, title) {
  // Remove existing player
  var existing = document.getElementById('vid-player-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'vid-player-overlay';
  overlay.innerHTML =
    '<div class="vid-player-backdrop" onclick="closeVideoPlayer()"></div>' +
    '<div class="vid-player-container">' +
      '<div class="vid-player-header">' +
        '<div class="vid-player-title">' + (title || '') + '</div>' +
        '<button onclick="closeVideoPlayer()" class="vid-player-close">&times;</button>' +
      '</div>' +
      '<div class="vid-player-frame">' +
        '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&color=red" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Animate in
  requestAnimationFrame(function() {
    overlay.classList.add('active');
  });
}

function closeVideoPlayer() {
  var overlay = document.getElementById('vid-player-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(function() {
      overlay.remove();
      document.body.style.overflow = '';
    }, 200);
  }
}

// Close on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeVideoPlayer();
});
