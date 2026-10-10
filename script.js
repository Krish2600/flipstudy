/* ================================================================
   script.js  –  FlipStudy Flashcard App
   Behaviour layer: data, rendering, user interactions.
   No HTML is hardcoded in index.html for cards; all DOM nodes are
   built with document.createElement() here.
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. DATA  –  The source-of-truth card array
      Each object: { id, category, question, answer, status }
      status starts as "review"; toggled to "known" by the user.
   ---------------------------------------------------------------- */
const cards = [

  /* ── Category 1: JavaScript Fundamentals ── */
  {
    id: 1,
    category: 'JavaScript',
    question: 'What is the difference between `let` and `var`?',
    answer:
      '`let` is block-scoped and not hoisted to a usable value; `var` is function-scoped and hoisted (initialised to `undefined`).',
    status: 'review',
  },
  {
    id: 2,
    category: 'JavaScript',
    question: 'What does the `===` operator check?',
    answer:
      'Strict equality – it checks both value AND type, so `"5" === 5` is `false`.',
    status: 'review',
  },
  {
    id: 3,
    category: 'JavaScript',
    question: 'What is a closure in JavaScript?',
    answer:
      'A closure is a function that retains access to its outer (lexical) scope even after the outer function has returned.',
    status: 'review',
  },
  {
    id: 4,
    category: 'JavaScript',
    question: 'What does `Array.prototype.map()` return?',
    answer:
      'A new array of the same length, where each element is the result of calling the callback on the corresponding element of the original array.',
    status: 'review',
  },

  /* ── Category 2: Web APIs ── */
  {
    id: 5,
    category: 'Web APIs',
    question: 'What does `document.querySelector()` return?',
    answer:
      'The first Element within the document that matches the given CSS selector, or `null` if no match is found.',
    status: 'review',
  },
  {
    id: 6,
    category: 'Web APIs',
    question: 'What is the purpose of `event.preventDefault()`?',
    answer:
      'It cancels the default browser action for an event (e.g. stopping a form submit from navigating the page).',
    status: 'review',
  },
  {
    id: 7,
    category: 'Web APIs',
    question: 'What is the Fetch API used for?',
    answer:
      'Making HTTP requests from the browser. It returns a Promise that resolves to a `Response` object.',
    status: 'review',
  },
  {
    id: 8,
    category: 'Web APIs',
    question: 'What does `localStorage.setItem(key, value)` do?',
    answer:
      'Stores a string value under the given key in the browser\'s localStorage, which persists across sessions.',
    status: 'review',
  },

  /* ── Category 3: CSS Fundamentals ── */
  {
    id: 9,
    category: 'CSS',
    question: 'What does `box-sizing: border-box` change?',
    answer:
      'It makes the element\'s stated width/height include padding and border, so they don\'t add to the element\'s total size.',
    status: 'review',
  },
  {
    id: 10,
    category: 'CSS',
    question: 'What is the difference between `flexbox` and `grid`?',
    answer:
      'Flexbox is one-dimensional (row OR column). CSS Grid is two-dimensional (rows AND columns simultaneously).',
    status: 'review',
  },
  {
    id: 11,
    category: 'CSS',
    question: 'What is specificity in CSS?',
    answer:
      'A weight system that determines which rule wins when multiple selectors target the same element. Inline > ID > Class > Tag.',
    status: 'review',
  },
  {
    id: 12,
    category: 'CSS',
    question: 'What does `z-index` control?',
    answer:
      'The stacking order of positioned elements along the z-axis. Higher values appear in front of lower values.',
    status: 'review',
  },
];


/* ----------------------------------------------------------------
   2. STATE  –  tracks which filters are active
   ---------------------------------------------------------------- */
const state = {
  activeCategory: 'all',   // 'all' or a category name string
  activeStatus:   'all',   // 'all' | 'known' | 'review'
};


/* ----------------------------------------------------------------
   3. DOM REFERENCES  –  cached once at startup
   ---------------------------------------------------------------- */
const deckSection       = document.getElementById('deck-section');
const progressDisplay   = document.getElementById('progress-display');
const categoryFilters   = document.getElementById('category-filters');
const statusFilterBtns  = document.querySelectorAll('.status-filter');
const shuffleBtn        = document.getElementById('shuffle-btn');
const emptyState        = document.getElementById('empty-state');


/* ================================================================
   4. RENDERING FUNCTIONS
   ================================================================ */

/* ----------------------------------------------------------------
   4a. renderProgress()
       Computes the "N / 12 known" counter using Array.filter()
       and updates the DOM text node.
   ---------------------------------------------------------------- */
function renderProgress() {
  const knownCount = cards.filter((c) => c.status === 'known').length;
  progressDisplay.textContent = `${knownCount} / ${cards.length} known`;
}


/* ----------------------------------------------------------------
   4b. getFilteredCards()
       Returns a subset of `cards` based on the active category
       and status filters, using Array.filter() chained calls.
   ---------------------------------------------------------------- */
function getFilteredCards() {
  return cards
    .filter((c) =>
      state.activeCategory === 'all' || c.category === state.activeCategory
    )
    .filter((c) =>
      state.activeStatus === 'all' || c.status === state.activeStatus
    );
}


/* ----------------------------------------------------------------
   4c. buildCardElement(cardData)
       Constructs a single <article> flashcard using only
       document.createElement() — no innerHTML concatenation.

       DOM structure produced:
         <article class="flashcard" data-id="…" data-status="…">
           <div class="card-inner">
             <div class="card-face card-front"> … </div>
             <div class="card-face card-back">  … </div>
           </div>
         </article>
   ---------------------------------------------------------------- */
function buildCardElement(cardData) {
  /* ── Outer <article> ── */
  const article = document.createElement('article');
  article.className = 'flashcard';
  article.dataset.id     = cardData.id;
  article.dataset.status = cardData.status;
  article.setAttribute('tabindex', '0');   // keyboard-focusable
  article.setAttribute('aria-label', `Flashcard: ${cardData.question}`);

  /* ── Inner rotating wrapper ── */
  const inner = document.createElement('div');
  inner.className = 'card-inner';

  /* ── FRONT FACE ── */
  const front = document.createElement('div');
  front.className = 'card-face card-front';

  // Category badge
  const badge = document.createElement('span');
  badge.className = 'card-category';
  badge.textContent = cardData.category;

  // "Question" label
  const qLabel = document.createElement('p');
  qLabel.className = 'card-label';
  qLabel.textContent = 'Question';

  // Question text
  const qText = document.createElement('p');
  qText.className = 'card-text';
  qText.textContent = cardData.question;

  // Flip hint
  const hint = document.createElement('p');
  hint.className = 'card-hint';
  hint.textContent = 'Click to reveal answer';

  front.appendChild(badge);
  front.appendChild(qLabel);
  front.appendChild(qText);
  front.appendChild(hint);

  /* ── BACK FACE ── */
  const back = document.createElement('div');
  back.className = 'card-face card-back';

  // "Answer" label
  const aLabel = document.createElement('p');
  aLabel.className = 'card-label';
  aLabel.textContent = 'Answer';

  // Answer text
  const aText = document.createElement('p');
  aText.className = 'card-text';
  aText.textContent = cardData.answer;

  // Status toggle button
  const statusBtn = document.createElement('button');
  statusBtn.className = `btn-status status-${cardData.status}`;
  statusBtn.dataset.id = cardData.id;
  statusBtn.textContent =
    cardData.status === 'known' ? '✓ Known – Mark for Review' : '✗ Needs Review – Mark Known';

  back.appendChild(aLabel);
  back.appendChild(aText);
  back.appendChild(statusBtn);

  /* ── Assemble ── */
  inner.appendChild(front);
  inner.appendChild(back);
  article.appendChild(inner);

  return article;
}


/* ----------------------------------------------------------------
   4d. renderDeck()
       Clears the deck, filters the data, then builds and appends
       a new <article> for every visible card. Also shows/hides
       the empty-state section.
   ---------------------------------------------------------------- */
function renderDeck() {
  // Remove all existing card elements
  while (deckSection.firstChild) {
    deckSection.removeChild(deckSection.firstChild);
  }

  const visible = getFilteredCards();

  if (visible.length === 0) {
    // Show empty-state, hide deck grid
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  // Build and append one <article> per visible card
  visible.forEach((cardData) => {
    const el = buildCardElement(cardData);
    deckSection.appendChild(el);
  });

  // Always keep progress in sync
  renderProgress();
}


/* ----------------------------------------------------------------
   4e. buildCategoryFilters()
       Derives unique category names from the cards array and
       creates one <button> per category plus an "All" button.
       Called once on init.
   ---------------------------------------------------------------- */
function buildCategoryFilters() {
  // Derive unique categories, preserving first-seen order
  const categories = ['all', ...new Set(cards.map((c) => c.category))];

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn category-filter';
    btn.dataset.category = cat;
    btn.textContent = cat === 'all' ? 'All Topics' : cat;
    btn.id = `cat-${cat.replace(/\s+/g, '-').toLowerCase()}`;

    if (cat === 'all') {
      btn.classList.add('active');
    }

    categoryFilters.appendChild(btn);
  });
}


/* ================================================================
   5. INTERACTION HELPERS
   ================================================================ */

/* ----------------------------------------------------------------
   5a. toggleFlip(cardEl)
       Toggles the .flipped class on the <article> element.
       The actual 3D rotation is handled entirely by CSS.
   ---------------------------------------------------------------- */
function toggleFlip(cardEl) {
  cardEl.classList.toggle('flipped');
}


/* ----------------------------------------------------------------
   5b. updateCardStatus(id, newStatus)
       Updates the card's status in the in-memory `cards` array,
       then re-renders both the status button and the progress bar
       without rebuilding the whole deck (better UX for the user).
   ---------------------------------------------------------------- */
function updateCardStatus(cardId, newStatus) {
  // 1. Find and mutate the card object in the source array
  const card = cards.find((c) => c.id === cardId);
  if (!card) return;
  card.status = newStatus;

  // 2. Update the data-status attribute on the <article>
  const article = deckSection.querySelector(`[data-id="${cardId}"]`);
  if (article) {
    article.dataset.status = newStatus;

    // 3. Update the status button's label and class
    const btn = article.querySelector('.btn-status');
    if (btn) {
      btn.className = `btn-status status-${newStatus}`;
      btn.textContent =
        newStatus === 'known'
          ? '✓ Known – Mark for Review'
          : '✗ Needs Review – Mark Known';
    }
  }

  // 4. Re-render progress counter
  renderProgress();

  // 5. If a status filter is active, re-render deck to hide the card
  //    (it no longer matches the filter)
  if (state.activeStatus !== 'all') {
    renderDeck();
  }
}


/* ----------------------------------------------------------------
   5c. fisherYatesShuffle(array)
       In-place Fisher–Yates shuffle. Returns the same array
       reference (mutated) so no cards are lost or duplicated.
   ---------------------------------------------------------------- */
function fisherYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at i and j using destructuring
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


/* ----------------------------------------------------------------
   5d. setActiveFilter(groupBtns, clickedBtn)
       Removes 'active' from all buttons in a group, then applies
       it to the clicked one. Generic utility used by both filter
       groups.
   ---------------------------------------------------------------- */
function setActiveFilter(groupEl, clickedBtn) {
  groupEl
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.remove('active'));
  clickedBtn.classList.add('active');
}


/* ================================================================
   6. EVENT LISTENERS
   ================================================================ */

/* ----------------------------------------------------------------
   6a. Card flip  –  delegated from #deck-section
       Click anywhere on a card except the status button flips it.
   ---------------------------------------------------------------- */
deckSection.addEventListener('click', (event) => {
  // Ignore clicks that originated on the status button
  if (event.target.closest('.btn-status')) return;

  const cardEl = event.target.closest('.flashcard');
  if (cardEl) {
    toggleFlip(cardEl);
  }
});

/* Keyboard accessibility: Space/Enter also flips focused cards */
deckSection.addEventListener('keydown', (event) => {
  if (event.key !== ' ' && event.key !== 'Enter') return;
  if (event.target.closest('.btn-status')) return;

  const cardEl = event.target.closest('.flashcard');
  if (cardEl) {
    event.preventDefault();   // stop Space from scrolling the page
    toggleFlip(cardEl);
  }
});


/* ----------------------------------------------------------------
   6b. Status button  –  delegated from #deck-section
       Toggles a card's status between "known" and "review".
   ---------------------------------------------------------------- */
deckSection.addEventListener('click', (event) => {
  const btn = event.target.closest('.btn-status');
  if (!btn) return;

  event.stopPropagation();     // prevent the flip listener from firing

  const cardId    = Number(btn.dataset.id);
  const card      = cards.find((c) => c.id === cardId);
  if (!card) return;

  // Toggle: if known → set review; if review → set known
  const newStatus = card.status === 'known' ? 'review' : 'known';
  updateCardStatus(cardId, newStatus);
});


/* ----------------------------------------------------------------
   6c. Shuffle button
   ---------------------------------------------------------------- */
shuffleBtn.addEventListener('click', () => {
  fisherYatesShuffle(cards);   // mutates the source array in-place
  renderDeck();                 // rebuild deck in the new order
});


/* ----------------------------------------------------------------
   6d. Category filter buttons  –  delegated from #category-filters
   ---------------------------------------------------------------- */
categoryFilters.addEventListener('click', (event) => {
  const btn = event.target.closest('.category-filter');
  if (!btn) return;

  state.activeCategory = btn.dataset.category;
  setActiveFilter(categoryFilters, btn);
  renderDeck();
});


/* ----------------------------------------------------------------
   6e. Status filter buttons  –  attached to each button individually
       (there are only 3, so delegation overhead not needed)
   ---------------------------------------------------------------- */
statusFilterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.activeStatus = btn.dataset.status;
    setActiveFilter(document.getElementById('status-filters'), btn);
    renderDeck();
  });
});


/* ================================================================
   7. INITIALISATION  –  runs once on page load
   ================================================================ */
function init() {
  buildCategoryFilters();   // create category filter buttons
  renderDeck();             // render the full deck
  renderProgress();         // show initial "0 / 12 known"
}

init();
