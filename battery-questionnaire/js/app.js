/**
 * Main App Controller — two-phase flow: Gate → Gate Result → Deep Dive → Email → Full Report.
 */

const App = {
  engine: null,
  currentQuestionIndex: 0,
  visibleQuestions: [],
  emailUnlocked: false,
  phase: 'gate', // 'gate' or 'deep_dive'

  async init() {
    this.engine = new QuestionnaireEngine();
    await this.engine.loadRegulations();
    this.bindEvents();
    this.showScreen('landing');
  },

  bindEvents() {
    document.getElementById('start-btn').addEventListener('click', () => this.startQuestionnaire());
    document.getElementById('restart-btn')?.addEventListener('click', () => this.restart());
  },

  // ── Screen Management ──────────────────────────────────────
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) {
      screen.classList.add('active');
      window.scrollTo(0, 0);
    }
  },

  // ── Questionnaire Flow ─────────────────────────────────────
  startQuestionnaire() {
    this.engine.reset();
    this.phase = 'gate';
    this.currentQuestionIndex = 0;
    this.updateVisibleQuestions();
    this.showScreen('questions');
    this.renderQuestion();
  },

  restart() {
    this.emailUnlocked = false;
    this.startQuestionnaire();
  },

  updateVisibleQuestions() {
    if (this.phase === 'gate') {
      this.visibleQuestions = getGateQuestions(this.engine.answers);
    } else {
      this.visibleQuestions = getDeepDiveQuestions(this.engine.answers);
    }
  },

  getCurrentQuestion() {
    return this.visibleQuestions[this.currentQuestionIndex] || null;
  },

  renderQuestion() {
    const q = this.getCurrentQuestion();
    if (!q) {
      if (this.phase === 'gate') {
        return this.showGateResult();
      } else {
        return this.showResults();
      }
    }

    const container = document.getElementById('question-container');
    const progressBar = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const sectionLabel = document.getElementById('section-label');
    const backBtn = document.getElementById('back-btn');

    // Progress
    const progress = ((this.currentQuestionIndex) / this.visibleQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${this.currentQuestionIndex + 1} of ${this.visibleQuestions.length}`;

    if (this.phase === 'gate') {
      sectionLabel.textContent = 'Quick Check';
    } else {
      sectionLabel.textContent = `${q.section}`;
    }

    // Back button visibility
    const canGoBack = this.currentQuestionIndex > 0 || this.phase === 'deep_dive';
    backBtn.style.visibility = canGoBack ? 'visible' : 'hidden';
    backBtn.onclick = () => this.goBack();

    // Current answer
    const currentAnswer = this.engine.getAnswer(q.id);

    // Build question HTML
    let html = `
      <div class="question-slide">
        <h2 class="question-text">${q.question}</h2>
        ${q.subtitle ? `<p class="question-subtitle">${q.subtitle}</p>` : ''}
        <div class="options-grid ${q.type === 'multi' ? 'multi-select' : ''}">
    `;

    q.options.forEach(opt => {
      const isSelected = q.type === 'multi'
        ? (currentAnswer && currentAnswer.includes(opt.id))
        : (currentAnswer === opt.id);

      html += `
        <button class="option-card ${isSelected ? 'selected' : ''}"
                data-option-id="${opt.id}"
                data-question-id="${q.id}"
                data-question-type="${q.type}">
          <div class="option-check">${isSelected ? '\u2713' : ''}</div>
          <div class="option-content">
            <span class="option-label">${opt.label}</span>
            ${opt.description ? `<span class="option-description">${opt.description}</span>` : ''}
          </div>
        </button>
      `;
    });

    html += `</div>`;

    if (q.type === 'multi') {
      html += `
        <button class="btn btn-primary btn-continue" id="continue-btn"
                ${!currentAnswer || currentAnswer.length === 0 ? 'disabled' : ''}>
          Continue
        </button>
      `;
    }

    html += `</div>`;

    // Animate transition
    container.classList.add('slide-out');
    setTimeout(() => {
      container.innerHTML = html;
      container.classList.remove('slide-out');
      container.classList.add('slide-in');
      setTimeout(() => container.classList.remove('slide-in'), 350);
      this.bindOptionEvents(q);
    }, 200);
  },

  bindOptionEvents(question) {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const optionId = card.dataset.optionId;
        const type = card.dataset.questionType;

        if (type === 'single') {
          cards.forEach(c => {
            c.classList.remove('selected');
            c.querySelector('.option-check').textContent = '';
          });
          card.classList.add('selected');
          card.querySelector('.option-check').textContent = '\u2713';

          this.engine.setAnswer(question.id, optionId);
          this.updateVisibleQuestions();

          setTimeout(() => this.goNext(), 300);
        } else {
          card.classList.toggle('selected');
          card.querySelector('.option-check').textContent = card.classList.contains('selected') ? '\u2713' : '';

          const selected = [];
          cards.forEach(c => {
            if (c.classList.contains('selected')) {
              selected.push(c.dataset.optionId);
            }
          });
          this.engine.setAnswer(question.id, selected);
          this.updateVisibleQuestions();

          const continueBtn = document.getElementById('continue-btn');
          if (continueBtn) {
            continueBtn.disabled = selected.length === 0;
          }
        }
      });
    });

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.goNext());
    }
  },

  goNext() {
    this.updateVisibleQuestions();

    // Early exit check during gate phase
    if (this.phase === 'gate') {
      const earlyVerdict = this.engine.canResolveGateEarly();
      if (earlyVerdict) {
        return this.showGateResult();
      }
    }

    if (this.currentQuestionIndex < this.visibleQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.renderQuestion();
    } else {
      if (this.phase === 'gate') {
        this.showGateResult();
      } else {
        this.showResults();
      }
    }
  },

  goBack() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.updateVisibleQuestions();
      this.renderQuestion();
    } else if (this.phase === 'deep_dive') {
      // Back from first deep dive question → gate result screen
      this.showGateResult();
    }
  },

  // ── Gate Result ─────────────────────────────────────────────
  showGateResult() {
    this.showScreen('gate-result');
    const container = document.getElementById('gate-result-container');
    container.innerHTML = Results.renderGateResult(this.engine);
    this.bindGateResultEvents();
  },

  bindGateResultEvents() {
    const deepDiveBtn = document.getElementById('gate-deep-dive-btn');
    if (deepDiveBtn) {
      deepDiveBtn.addEventListener('click', () => this.startDeepDive());
    }

    const restartBtn = document.getElementById('gate-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }
  },

  startDeepDive() {
    this.phase = 'deep_dive';
    this.currentQuestionIndex = 0;
    this.updateVisibleQuestions();
    this.showScreen('questions');
    this.renderQuestion();
  },

  // ── Results ────────────────────────────────────────────────
  showResults() {
    this.showScreen('results');
    const container = document.getElementById('results-container');

    if (this.emailUnlocked) {
      container.innerHTML = Results.renderFull(this.engine);
      this.bindResultsTabs();
      this.bindPDFDownload();
    } else {
      container.innerHTML = Results.renderPreview(this.engine);
      this.bindEmailForm();
    }
  },

  bindEmailForm() {
    const form = document.getElementById('email-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('email-name').value;
      const email = document.getElementById('email-address').value;
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!email) return;

      // Disable button while saving
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Unlocking...';
      }

      await LeadCapture.saveLead({ name, email, engine: this.engine });

      this.emailUnlocked = true;
      this.showResults();
    });
  },

  bindResultsTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`tab-${tab.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });
  },

  bindPDFDownload() {
    const btn = document.getElementById('download-pdf');
    if (!btn) return;
    btn.addEventListener('click', () => {
      PDFReport.generate(this.engine);
    });
  }
};

// ── Bootstrap ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
