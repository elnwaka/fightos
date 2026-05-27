/* ============================================
   FIGHTOS – Video Library (Wissen)
   Curated boxing knowledge videos
   Custom player UI over YouTube embeds
   ============================================ */

var VIDEO_LIBRARY = [
  // === KAMPF-BREAKDOWNS: LEGENDEN ===
  {
    category: 'legends',
    categoryLabel: 'LEGENDEN ANALYSIERT',
    categoryDesc: 'Was die Größten der Geschichte anders gemacht haben — Technik die du klauen kannst.',
    videos: [
      { id: 'hq7evFpmVek', title: 'Mayweathers unterschätzte Taktiken', desc: 'Nicht der Defensive Mayweather den alle kennen — die offensiven Tricks die niemand sieht.', duration: '15:00', tags: ['Defense','Ring IQ','Konter'] },
      { id: 'pqroVNFSlcs', title: 'Wie Ali "Fehler" zu Meisterwerken machte', desc: 'Die Regeln die Ali brach — und warum sie trotzdem funktionieren.', duration: '16:00', tags: ['Unkonventionell','Kopfbewegung','Reichweite'] },
      { id: '73yNFaIG0Sc', title: 'Roberto Durans böser Stil', desc: 'Inside Fighting, Aggression und Druck auf höchstem Niveau.', duration: '14:00', tags: ['Infighter','Druck','Körper'] },
      { id: 'nQ75ROGzG2o', title: 'Finito Lopez — Gewalt als Eleganz', desc: 'Wie der kleine Meister rohe Kraft in Kunstform verwandelte.', duration: '15:00', tags: ['Technik','Effizienz','Klein'] },
      { id: 'ONap_xV3ViE', title: 'Der größte Defensiv-Boxer aller Zeiten', desc: 'Pernell Whitakers seidige Fußarbeit und unerreichte Defense.', duration: '14:00', tags: ['Defense','Fußarbeit','Slips'] }
    ]
  },

  // === KAMPF-BREAKDOWNS: AKTIVE KÄMPFER ===
  {
    category: 'active',
    categoryLabel: 'AKTIVE KÄMPFER',
    categoryDesc: 'Die Stile der besten aktiven Boxer verstehen — und für dein eigenes Boxen nutzen.',
    videos: [
      { id: 'HKU49EclMX8', title: 'Lomachenkos High-Tech-Stil', desc: 'Winkel kreieren, Guard-Manipulation, Fußarbeit die keiner kopieren kann — bis jetzt.', duration: '18:00', tags: ['Winkel','Fußarbeit','Guard'] },
      { id: 'TwHkGZvGZoM', title: 'Usyks System verstehen', desc: 'Das komplette System — vom Cruiser zum Schwergewicht. Wie er trainiert und warum es funktioniert.', duration: '20:00', tags: ['System','Allrounder','Taktik'] },
      { id: 'Yc6RaEjDwl8', title: 'Naoya Inoues Killer-Stil', desc: 'Der gefährlichste Bantamgewichtler der Geschichte — Timing, Power, Finishing.', duration: '14:00', tags: ['Power','Timing','KO'] },
      { id: 'sYmTdwP40Yc', title: 'Ryan Garcias Stil — mehr als Speed?', desc: 'Was steckt wirklich hinter dem schnellen Stil? Passive Skills und Führhand-Arbeit.', duration: '13:00', tags: ['Speed','Führhand','Counter'] },
      { id: 'lly-AuwD-zc', title: 'Subriel Matias — Unkonventionell aber effektiv', desc: 'Warum sein "falscher" Stil funktioniert. Druck, Körperschläge, Willenskraft.', duration: '12:00', tags: ['Druck','Körper','Wille'] },
      { id: 'y1UZRV266B0', title: 'Caleb Plants kreative Techniken', desc: 'Shovel Jab, Shovel Hook, geschmeidige Fußarbeit. Kreativität im Ring.', duration: '13:00', tags: ['Jab-Varianten','Kreativität','Führhand'] },
      { id: 'Ihe9nXXyo1w', title: 'Andre Wards smarte Taktiken', desc: 'Der IQ-Champion. Clinch-Meister, Distanz-Kontrolle, Inside Fighting.', duration: '16:00', tags: ['Clinch','IQ','Inside'] },
      { id: 'dvMVNbOsU9k', title: 'Beste Skills der besten P4P-Boxer (Teil 1)', desc: 'Ein Skill von jedem Top-Boxer — zusammengefasst in einem Video.', duration: '20:00', tags: ['P4P','Skills','Kompilation'] }
    ]
  },

  // === RING IQ & TAKTIK ===
  {
    category: 'ringiQ',
    categoryLabel: 'RING IQ & TAKTIK',
    categoryDesc: 'Distanzkontrolle, Timing, Winkel, Ringschneiden — der mentale Kampf entscheidet.',
    videos: [
      { id: 'Po3Dwu1Bb30', title: 'Ring abschneiden — Stop den Runner', desc: 'Systematisch einkreisen und unter Druck setzen. Schritt für Schritt.', duration: '11:00', tags: ['Ring Cut','Druck','Fußarbeit'] },
      { id: 'Wlag12lY0U0', title: 'Dmitry Pirog — Schach im Ring', desc: 'Wie ein Großmeister Fußarbeit benutzt um den Ring zu kontrollieren.', duration: '15:00', tags: ['Ring Control','Fußarbeit','IQ'] },
      { id: 'fWSdk2qeRlY', title: 'Fußarbeit, Defense & Fight IQ Blueprint', desc: 'Kompletter Guide zu den drei Grundpfeilern. Lang aber essentiell.', duration: '45:00', tags: ['Fußarbeit','Defense','Komplett'] },
      { id: 'sHIaIDnxXbU', title: 'Den technisch perfekten Boxer bauen', desc: 'Was einen kompletten Boxer ausmacht und wie du dorthin kommst.', duration: '16:00', tags: ['Komplett','System','Technik'] },
      { id: 'QErNkgN5two', title: 'Wie die Top 1% der Boxer denken', desc: 'Entscheidungsfindung im Ring — warum manche Boxer immer einen Schritt voraus sind.', duration: '12:00', tags: ['Mindset','Entscheidung','Elite'] }
    ]
  },

  // === GRUNDLAGEN & TECHNIK ===
  {
    category: 'grundlagen',
    categoryLabel: 'GRUNDLAGEN',
    categoryDesc: 'Stance, Guard, Beinarbeit, Schläge — die Basis auf der alles aufbaut. Nicht überspringen.',
    videos: [
      { id: 'Jg2CgIK8nFk', title: 'Die langweiligen Grundlagen die stark machen', desc: 'Die Basics die keiner sexy findet aber die den Unterschied machen.', duration: '18:00', tags: ['Stance','Guard','Basics'] },
      { id: 'r7MUFC7xA0w', title: '10 Minuten die dein Boxen verbessern', desc: 'Sofort umsetzbare Verbesserungen für Amateurboxer.', duration: '10:00', tags: ['Amateur','Schnell','Umsetzbar'] },
      { id: 'N0U5RPGpjSg', title: '10 Skills meistern + 3 vermeiden', desc: 'Was du lernen musst und welche Gewohnheiten du sofort ablegen sollst.', duration: '20:00', tags: ['Anfänger','Skills','Fehler'] },
      { id: 'D8DouKeOkfI', title: 'Boxing 101 — Komplettes Tutorial', desc: 'Von Null auf Box-Grundlagen. Stance, Jab, Cross, Hook, Bewegung.', duration: '25:00', tags: ['Anfänger','Komplett','Schritt-für-Schritt'] }
    ]
  },

  // === SCHATTENBOXEN & TRAINING ===
  {
    category: 'training',
    categoryLabel: 'SCHATTENBOXEN & DRILLS',
    categoryDesc: 'Wie du alleine trainierst — Schattenboxen, Drills, Solo-Übungen mit System.',
    videos: [
      { id: 'rwAGGeOk4_Q', title: 'Wie Profis wirklich Schattenboxen', desc: 'Nicht einfach rumschwingen — mit System, Absicht und Visualisierung.', duration: '12:00', tags: ['Schattenboxen','System','Profis'] },
      { id: 'dMgBWqyUqTM', title: '21 Geheimnisse der Box-Technik', desc: 'Kurze, knackige Technik-Tipps die sofort umsetzbar sind.', duration: '8:00', tags: ['Tipps','Technik','Kurz'] },
      { id: 'nH-NsajI2tM', title: 'Beginner Boxing 101 — Willkommen', desc: 'Für absolute Anfänger: Erste Schritte im Boxen.', duration: '15:00', tags: ['Anfänger','Start','Einführung'] }
    ]
  },

  // === DEFENSE & KOPFBEWEGUNG ===
  {
    category: 'defense',
    categoryLabel: 'DEFENSE & KOPFBEWEGUNG',
    categoryDesc: 'Nicht getroffen werden ist genauso wichtig wie treffen. Slips, Rolls, Parries, Blocks.',
    videos: [
      { id: 'ONap_xV3ViE', title: 'Whitaker — Defensive Meisterschaft', desc: 'Der unerreichte Meister der Ausweichbewegungen.', duration: '14:00', tags: ['Slips','Rolls','Meister'] },
      { id: 'hq7evFpmVek', title: 'Mayweather — Defense als Waffe', desc: 'Wie Mayweather Defense offensiv nutzt — Shoulder Roll, Pull Counter, Check Hook.', duration: '15:00', tags: ['Shoulder Roll','Counter','Guard'] },
      { id: 'BV1wtKInZ5g', title: 'Fortgeschrittenes Box-Tutorial', desc: 'Über die Basics hinaus — Defense-Techniken für Fortgeschrittene.', duration: '22:00', tags: ['Fortgeschritten','Defense','Kombis'] }
    ]
  },

  // === S&C FÜR BOXER ===
  {
    category: 'sc',
    categoryLabel: 'KRAFT & CONDITIONING',
    categoryDesc: 'Sportwissenschaft für Boxer — die gleiche Methodik die FightOS nutzt.',
    videos: [
      { id: 'hmFQTjxlE5M', title: 'Conditioning-Methoden Ranking', desc: 'Zone 2 vs HIIT vs SIT — was funktioniert wirklich für Boxer?', duration: '22:00', tags: ['Conditioning','HIIT','Vergleich'] },
      { id: '22zeL5FuCv0', title: 'S&C individualisieren — Guide', desc: 'Kraft- und Konditionstraining an Level, Schwächen und Kampfkalender anpassen.', duration: '30:00', tags: ['Periodisierung','Individuell','System'] },
      { id: 'DajasFD5ExA', title: 'S&C im Amateur-Boxalltag', desc: 'Krafttraining mit Vereinstraining kombinieren ohne Überbelastung.', duration: '18:00', tags: ['Amateur','Planung','Praxis'] },
      { id: 'QmnpevLGSs4', title: 'Kraft & Power Workout', desc: 'Komplettes Workout — die Übungen aus dem FightOS-Programm.', duration: '25:00', tags: ['Workout','Mitmachen','Power'] },
      { id: 'cTlUErNBMRU', title: 'Ein Tag bei Boxing Science', desc: 'Wie professionelle Boxer ihren S&C-Tag strukturieren.', duration: '15:00', tags: ['Pro','Tagesablauf','Einblick'] },
      { id: '5rP3shb1lrE', title: '30-Min S&C Workout für Boxer', desc: 'Kurzes, intensives Workout wenn die Zeit knapp ist.', duration: '30:00', tags: ['Kurz','Intensiv','Mitmachen'] }
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
