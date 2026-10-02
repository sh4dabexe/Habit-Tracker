/**
 * Habit Tracker — Core Logic & Architecture
 * Minimal light-theme, edge-focused productivity application.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Storage Keys & Constants
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'habitTracker';
  const NOTES_STORAGE_KEY = 'habitTracker_notes';

  const DEFAULT_HABITS = [
    {
      id: 'h-1',
      name: 'Focused Deep Work',
      description: '90 minutes high-intensity technical execution',
      category: 'WORK',
      createdAt: '2026-10-01',
      checkpoints: [
        { id: 'cp-1-1', title: 'Clear workspace & eliminate tabs' },
        { id: 'cp-1-2', title: 'Phase 1: Architecture review' },
        { id: 'cp-1-3', title: 'Phase 2: Code implementation' },
        { id: 'cp-1-4', title: 'Commit and document learnings' }
      ],
      history: {
        '2026-10-01': {
          completedCheckpoints: ['cp-1-1', 'cp-1-2', 'cp-1-3', 'cp-1-4'],
          completed: true
        }
      }
    },
    {
      id: 'h-2',
      name: 'Physical Conditioning',
      description: 'Daily mobility and resistance routine',
      category: 'HEALTH',
      createdAt: '2026-10-01',
      checkpoints: [
        { id: 'cp-2-1', title: 'Joint mobility & dynamic warm-up' },
        { id: 'cp-2-2', title: 'Core & bodyweight circuit' },
        { id: 'cp-2-3', title: 'Post-workout stretch & hydration' }
      ],
      history: {
        '2026-10-01': {
          completedCheckpoints: ['cp-2-1', 'cp-2-2', 'cp-2-3'],
          completed: true
        }
      }
    },
    {
      id: 'h-3',
      name: 'Deliberate Reading',
      description: '30 pages technical or philosophical material',
      category: 'STUDY',
      createdAt: '2026-10-01',
      checkpoints: [
        { id: 'cp-3-1', title: 'Read 15 pages without phone' },
        { id: 'cp-3-2', title: 'Read 15 additional pages' },
        { id: 'cp-3-3', title: 'Write down 1 actionable insight' }
      ],
      history: {
        '2026-10-01': {
          completedCheckpoints: ['cp-3-1', 'cp-3-2', 'cp-3-3'],
          completed: true
        }
      }
    }
  ];

  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  let habits = [];
  let dailyNotes = {};
  let currentFilter = 'ALL';
  let habitToDeleteId = null;

  // Cache DOM elements
  const el = {
    // Header
    dateDay: document.getElementById('dateDay'),
    dateFull: document.getElementById('dateFull'),
    btnNewHabitHeader: document.getElementById('btnNewHabitHeader'),
    btnNewHabitSection: document.getElementById('btnNewHabitSection'),

    // Overview
    overallStatusLabel: document.getElementById('overallStatusLabel'),
    metricHabitsCount: document.getElementById('metricHabitsCount'),
    metricHabitsPct: document.getElementById('metricHabitsPct'),
    metricHabitsBar: document.getElementById('metricHabitsBar'),
    metricCheckpointsCount: document.getElementById('metricCheckpointsCount'),
    metricCheckpointsPct: document.getElementById('metricCheckpointsPct'),
    metricCheckpointsBar: document.getElementById('metricCheckpointsBar'),
    metricStreakCount: document.getElementById('metricStreakCount'),
    streakStatusText: document.getElementById('streakStatusText'),
    streakIndicator: document.getElementById('streakIndicator'),

    // Daily Note
    dailyNoteInput: document.getElementById('dailyNoteInput'),
    dailyNoteStatus: document.getElementById('dailyNoteStatus'),

    // Habits List
    habitsCountPill: document.getElementById('habitsCountPill'),
    categoryFilterGroup: document.getElementById('categoryFilterGroup'),
    habitsList: document.getElementById('habitsList'),
    emptyState: document.getElementById('emptyState'),
    btnEmptyCreate: document.getElementById('btnEmptyCreate'),

    // History & Summary
    historyDaysList: document.getElementById('historyDaysList'),
    summaryWeekCompleted: document.getElementById('summaryWeekCompleted'),
    summaryWeekRate: document.getElementById('summaryWeekRate'),
    summaryBestStreak: document.getElementById('summaryBestStreak'),
    summaryPerfectDays: document.getElementById('summaryPerfectDays'),

    // Modal
    habitModal: document.getElementById('habitModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalAlert: document.getElementById('modalAlert'),
    habitForm: document.getElementById('habitForm'),
    habitIdInput: document.getElementById('habitIdInput'),
    habitNameInput: document.getElementById('habitNameInput'),
    habitDescInput: document.getElementById('habitDescInput'),
    habitCategorySelect: document.getElementById('habitCategorySelect'),
    checkpointsListEditor: document.getElementById('checkpointsListEditor'),
    btnAddCheckpointRow: document.getElementById('btnAddCheckpointRow'),
    btnModalCancel: document.getElementById('btnModalCancel'),
    btnModalClose: document.getElementById('btnModalClose'),

    // Confirm Dialog
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    btnConfirmCancel: document.getElementById('btnConfirmCancel'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    btnConfirmClose: document.getElementById('btnConfirmClose'),

    // Footer actions
    btnExportData: document.getElementById('btnExportData'),
    btnImportDataTrigger: document.getElementById('btnImportDataTrigger'),
    fileImportInput: document.getElementById('fileImportInput'),
    btnResetAll: document.getElementById('btnResetAll')
  };

  // --------------------------------------------------------------------------
  // Date Utilities
  // --------------------------------------------------------------------------
  function getTodayDate() {
    return new Date();
  }

  function formatDateIso(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayIso() {
    return formatDateIso(getTodayDate());
  }

  function getDayName(dateObj) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[dateObj.getDay()];
  }

  function getFormattedDisplayDate(dateObj) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayNum = String(dateObj.getDate()).padStart(2, '0');
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${dayNum} ${month} ${year}`;
  }

  function updateDateHeader() {
    const now = getTodayDate();
    const dayName = getDayName(now);
    el.dateDay.textContent = `TODAY / ${dayName}`;
    el.dateFull.textContent = getFormattedDisplayDate(now);
  }

  // --------------------------------------------------------------------------
  // Persistence (localStorage)
  // --------------------------------------------------------------------------
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        habits = JSON.parse(stored);
      } else {
        // Seed default habits on clean start
        habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
        saveData();
      }

      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        dailyNotes = JSON.parse(storedNotes);
      } else {
        dailyNotes = {};
      }
    } catch (err) {
      console.error('Error loading data from localStorage', err);
      habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
      dailyNotes = {};
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (err) {
      console.error('Error saving habits to localStorage', err);
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(dailyNotes));
    } catch (err) {
      console.error('Error saving notes to localStorage', err);
    }
  }

  // --------------------------------------------------------------------------
  // Habit State Helpers
  // --------------------------------------------------------------------------
  function getDayRecord(habit, dateStr) {
    if (!habit.history) {
      habit.history = {};
    }
    if (!habit.history[dateStr]) {
      habit.history[dateStr] = {
        completedCheckpoints: [],
        completed: false
      };
    }
    return habit.history[dateStr];
  }

  function isCheckpointCompleted(habit, cpId, dateStr = getTodayIso()) {
    const record = getDayRecord(habit, dateStr);
    return record.completedCheckpoints.includes(cpId);
  }

  function isHabitCompleted(habit, dateStr = getTodayIso()) {
    if (!habit.checkpoints || habit.checkpoints.length === 0) return false;
    const record = getDayRecord(habit, dateStr);
    return record.completed === true;
  }

  function updateHabitDayCompletion(habit, dateStr = getTodayIso()) {
    const record = getDayRecord(habit, dateStr);
    const total = habit.checkpoints ? habit.checkpoints.length : 0;
    const completedCount = record.completedCheckpoints.length;
    record.completed = total > 0 && completedCount === total;
  }

  // --------------------------------------------------------------------------
  // Streak Calculation (Section 9)
  // --------------------------------------------------------------------------
  function calculateStreak() {
    if (habits.length === 0) return 0;

    const today = getTodayDate();
    let streak = 0;

    // Check today's completion status
    const todayIso = formatDateIso(today);
    const todayAllComplete = habits.every(h => isHabitCompleted(h, todayIso));

    let checkDate = new Date(today.getTime());

    if (todayAllComplete) {
      // Today counts toward streak
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Today is in progress; check if yesterday was fully completed
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Move backwards day-by-day
    while (true) {
      const dateIso = formatDateIso(checkDate);
      // Check if all existing habits were completed on this date
      const allDone = habits.length > 0 && habits.every(h => isHabitCompleted(h, dateIso));

      if (allDone) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }

      // Safety limit (e.g. 365 days max)
      if (streak > 365) break;
    }

    return streak;
  }

  // --------------------------------------------------------------------------
  // Overview & Metrics Calculation
  // --------------------------------------------------------------------------
  function renderOverview() {
    const todayIso = getTodayIso();
    const totalHabits = habits.length;

    if (totalHabits === 0) {
      el.metricHabitsCount.textContent = '0 / 0';
      el.metricHabitsPct.textContent = '0%';
      el.metricHabitsBar.style.width = '0%';

      el.metricCheckpointsCount.textContent = '0 / 0';
      el.metricCheckpointsPct.textContent = '0%';
      el.metricCheckpointsBar.style.width = '0%';

      el.metricStreakCount.textContent = '0';
      el.overallStatusLabel.textContent = 'NO HABITS';
      el.streakStatusText.textContent = 'Create a habit to begin tracking';
      return;
    }

    // Habits completion
    let completedHabits = 0;
    let totalCheckpoints = 0;
    let completedCheckpoints = 0;

    habits.forEach(h => {
      const record = getDayRecord(h, todayIso);
      const cpCount = h.checkpoints ? h.checkpoints.length : 0;
      totalCheckpoints += cpCount;
      completedCheckpoints += record.completedCheckpoints.length;
      if (record.completed) {
        completedHabits++;
      }
    });

    const habitsPct = Math.round((completedHabits / totalHabits) * 100);
    const cpPct = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

    el.metricHabitsCount.textContent = `${completedHabits} / ${totalHabits}`;
    el.metricHabitsPct.textContent = `${habitsPct}%`;
    el.metricHabitsBar.style.width = `${habitsPct}%`;

    el.metricCheckpointsCount.textContent = `${completedCheckpoints} / ${totalCheckpoints}`;
    el.metricCheckpointsPct.textContent = `${cpPct}%`;
    el.metricCheckpointsBar.style.width = `${cpPct}%`;

    // Streak
    const streak = calculateStreak();
    el.metricStreakCount.textContent = streak;

    if (completedHabits === totalHabits && totalHabits > 0) {
      el.overallStatusLabel.textContent = 'ALL COMPLETE';
      el.streakStatusText.textContent = 'All habits achieved for today';
      el.streakIndicator.querySelector('.streak-dot').classList.add('active');
    } else {
      el.overallStatusLabel.textContent = `${totalHabits - completedHabits} REMAINING`;
      el.streakStatusText.textContent = `${completedHabits} of ${totalHabits} completed today`;
    }
  }

  // --------------------------------------------------------------------------
  // Habits Rendering
  // --------------------------------------------------------------------------
  function renderHabits() {
    const todayIso = getTodayIso();
    const filtered = habits.filter(h => {
      if (currentFilter === 'ALL') return true;
      return (h.category || 'GENERAL').toUpperCase() === currentFilter;
    });

    el.habitsCountPill.textContent = habits.length;

    if (habits.length === 0) {
      el.habitsList.innerHTML = '';
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');

    if (filtered.length === 0) {
      el.habitsList.innerHTML = `
        <div class="empty-state" style="padding: 2rem;">
          <p class="empty-desc">No habits found in category <strong>${escapeHtml(currentFilter)}</strong>.</p>
        </div>
      `;
      return;
    }

    let html = '';

    filtered.forEach((habit, idx) => {
      const record = getDayRecord(habit, todayIso);
      const isComplete = record.completed;
      const totalCp = habit.checkpoints ? habit.checkpoints.length : 0;
      const doneCp = record.completedCheckpoints.length;
      const pct = totalCp > 0 ? Math.round((doneCp / totalCp) * 100) : 0;
      const paddedIndex = String(idx + 1).padStart(2, '0');

      // Checkpoints HTML
      let checkpointsHtml = '';
      if (habit.checkpoints && habit.checkpoints.length > 0) {
        habit.checkpoints.forEach(cp => {
          const cpDone = record.completedCheckpoints.includes(cp.id);
          checkpointsHtml += `
            <div 
              class="checkpoint-row ${cpDone ? 'is-done' : ''}" 
              data-habit-id="${escapeHtml(habit.id)}" 
              data-cp-id="${escapeHtml(cp.id)}" 
              role="checkbox" 
              aria-checked="${cpDone}" 
              tabindex="0"
            >
              <div class="checkpoint-box">${cpDone ? '✓' : ''}</div>
              <span class="checkpoint-title">${escapeHtml(cp.title)}</span>
            </div>
          `;
        });
      }

      html += `
        <article class="habit-card ${isComplete ? 'is-complete' : ''}" data-id="${escapeHtml(habit.id)}">
          <div class="habit-card-header">
            <div class="habit-meta-wrap">
              <span class="habit-index">${paddedIndex}</span>
              <div class="habit-details">
                <div class="habit-title-row">
                  <h3 class="habit-title">${escapeHtml(habit.name)}</h3>
                  <span class="habit-category-badge">${escapeHtml(habit.category || 'GENERAL')}</span>
                </div>
                ${habit.description ? `<p class="habit-desc">${escapeHtml(habit.description)}</p>` : ''}
              </div>
            </div>

            <div class="habit-actions">
              <button 
                class="btn-icon-action btn-habit-reset" 
                data-id="${escapeHtml(habit.id)}" 
                title="Reset today's checkpoints"
              >
                Reset
              </button>
              <button 
                class="btn-icon-action btn-habit-edit" 
                data-id="${escapeHtml(habit.id)}" 
                title="Edit habit"
              >
                Edit
              </button>
              <button 
                class="btn-icon-action btn-action-danger btn-habit-delete" 
                data-id="${escapeHtml(habit.id)}" 
                title="Delete habit"
              >
                Delete
              </button>
            </div>
          </div>

          <div class="habit-checkpoints">
            ${checkpointsHtml}
          </div>

          <div class="habit-card-footer">
            <span class="habit-progress-stat">
              ${doneCp} / ${totalCp} completed
            </span>
            <div class="habit-progress-mini-bar" aria-hidden="true">
              <div class="habit-progress-mini-fill" style="width: ${pct}%"></div>
            </div>
            <span class="habit-progress-pct">${pct}%</span>
          </div>
        </article>
      `;
    });

    el.habitsList.innerHTML = html;
  }

  // --------------------------------------------------------------------------
  // History & Consistency Log (Section 15, Phase 7)
  // --------------------------------------------------------------------------
  function renderHistory() {
    const today = getTodayDate();
    const todayIso = formatDateIso(today);
    let historyRowsHtml = '';

    let weekCompletedTotal = 0;
    let weekPossibleTotal = 0;
    let perfectDays = 0;

    // Last 7 days (including today)
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime());
      d.setDate(d.getDate() - i);
      const dateIso = formatDateIso(d);
      const isToday = dateIso === todayIso;
      const dayName = getDayName(d);
      const formattedDate = `${String(d.getDate()).padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]}`;

      let dayTotal = habits.length;
      let dayCompleted = 0;

      habits.forEach(h => {
        if (isHabitCompleted(h, dateIso)) {
          dayCompleted++;
        }
      });

      const pct = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;

      weekCompletedTotal += dayCompleted;
      weekPossibleTotal += dayTotal;
      if (dayTotal > 0 && dayCompleted === dayTotal) {
        perfectDays++;
      }

      let statusBadge = '<span class="status-badge none">INCOMPLETE</span>';
      if (dayTotal > 0 && dayCompleted === dayTotal) {
        statusBadge = '<span class="status-badge perfect">PERFECT</span>';
      } else if (dayCompleted > 0) {
        statusBadge = '<span class="status-badge partial">PARTIAL</span>';
      }

      historyRowsHtml += `
        <div class="history-row ${isToday ? 'is-today' : ''}">
          <span class="day-name">${dayName}</span>
          <span class="date-str">${formattedDate}</span>
          <span class="habits-ratio">${dayCompleted} / ${dayTotal}</span>
          <div class="history-bar-wrap">
            <div class="history-bar-fill" style="width: ${pct}%"></div>
          </div>
          ${statusBadge}
        </div>
      `;
    }

    el.historyDaysList.innerHTML = historyRowsHtml;

    // Weekly Summary box (16.3)
    const weekRate = weekPossibleTotal > 0 ? Math.round((weekCompletedTotal / weekPossibleTotal) * 100) : 0;
    const bestStreak = calculateStreak();

    el.summaryWeekCompleted.textContent = weekCompletedTotal;
    el.summaryWeekRate.textContent = `${weekRate}%`;
    el.summaryBestStreak.textContent = `${bestStreak} days`;
    el.summaryPerfectDays.textContent = `${perfectDays} / 7`;
  }

  // --------------------------------------------------------------------------
  // Daily Note Logic (Section 16.2)
  // --------------------------------------------------------------------------
  function setupDailyNotes() {
    const todayIso = getTodayIso();
    el.dailyNoteInput.value = dailyNotes[todayIso] || '';

    el.dailyNoteInput.addEventListener('input', () => {
      dailyNotes[todayIso] = el.dailyNoteInput.value.trim();
      el.dailyNoteStatus.textContent = 'Saving...';
      debounceNoteSave();
    });
  }

  let noteTimer = null;
  function debounceNoteSave() {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      saveNotes();
      el.dailyNoteStatus.textContent = 'Saved';
    }, 400);
  }

  // --------------------------------------------------------------------------
  // Checkpoint Interaction
  // --------------------------------------------------------------------------
  function handleCheckpointsClick(e) {
    const row = e.target.closest('.checkpoint-row');
    if (!row) return;

    const habitId = row.dataset.habitId;
    const cpId = row.dataset.cpId;
    const habit = habits.find(h => String(h.id) === String(habitId));
    if (!habit) return;

    const todayIso = getTodayIso();
    const record = getDayRecord(habit, todayIso);

    const idx = record.completedCheckpoints.indexOf(cpId);
    if (idx > -1) {
      record.completedCheckpoints.splice(idx, 1);
    } else {
      record.completedCheckpoints.push(cpId);
    }

    updateHabitDayCompletion(habit, todayIso);
    saveData();
    renderHabits();
    renderOverview();
    renderHistory();
  }

  // --------------------------------------------------------------------------
  // Habit Actions (Reset, Edit, Delete)
  // --------------------------------------------------------------------------
  function handleHabitAction(e) {
    const resetBtn = e.target.closest('.btn-habit-reset');
    const editBtn = e.target.closest('.btn-habit-edit');
    const deleteBtn = e.target.closest('.btn-habit-delete');

    if (resetBtn) {
      const habitId = resetBtn.dataset.id;
      const habit = habits.find(h => String(h.id) === String(habitId));
      if (habit) {
        const todayIso = getTodayIso();
        const record = getDayRecord(habit, todayIso);
        record.completedCheckpoints = [];
        record.completed = false;
        saveData();
        renderHabits();
        renderOverview();
        renderHistory();
      }
      return;
    }

    if (editBtn) {
      const habitId = editBtn.dataset.id;
      const habit = habits.find(h => String(h.id) === String(habitId));
      if (habit) {
        openEditModal(habit);
      }
      return;
    }

    if (deleteBtn) {
      const habitId = deleteBtn.dataset.id;
      const habit = habits.find(h => String(h.id) === String(habitId));
      if (habit) {
        habitToDeleteId = habitId;
        el.confirmMessage.textContent = `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`;
        el.confirmModal.showModal();
      }
      return;
    }
  }

  // --------------------------------------------------------------------------
  // Modal & Form Logic (Sections 6, 7, 18, 22)
  // --------------------------------------------------------------------------
  function showModalAlert(msg) {
    el.modalAlert.textContent = msg;
    el.modalAlert.classList.remove('hidden');
  }

  function hideModalAlert() {
    el.modalAlert.textContent = '';
    el.modalAlert.classList.add('hidden');
  }

  function createCheckpointEditorRow(title = '', index = 1) {
    const row = document.createElement('div');
    row.className = 'cp-editor-row';
    row.innerHTML = `
      <span class="cp-editor-num">${index}.</span>
      <input 
        type="text" 
        class="cp-editor-input" 
        placeholder="Checkpoint action..." 
        value="${escapeHtml(title)}"
        maxlength="80"
        required
      >
      <button type="button" class="cp-editor-remove" title="Remove checkpoint" aria-label="Remove checkpoint">&times;</button>
    `;

    row.querySelector('.cp-editor-remove').addEventListener('click', () => {
      row.remove();
      renumberCheckpointRows();
    });

    return row;
  }

  function renumberCheckpointRows() {
    const rows = el.checkpointsListEditor.querySelectorAll('.cp-editor-row');
    rows.forEach((r, i) => {
      const numSpan = r.querySelector('.cp-editor-num');
      if (numSpan) numSpan.textContent = `${i + 1}.`;
    });
  }

  function openCreateModal() {
    hideModalAlert();
    el.modalTitle.textContent = 'NEW HABIT';
    el.habitIdInput.value = '';
    el.habitNameInput.value = '';
    el.habitDescInput.value = '';
    el.habitCategorySelect.value = 'GENERAL';
    el.checkpointsListEditor.innerHTML = '';

    // Default 2 checkpoint fields for convenience
    el.checkpointsListEditor.appendChild(createCheckpointEditorRow('', 1));
    el.checkpointsListEditor.appendChild(createCheckpointEditorRow('', 2));

    el.habitModal.showModal();
    el.habitNameInput.focus();
  }

  function openEditModal(habit) {
    hideModalAlert();
    el.modalTitle.textContent = 'EDIT HABIT';
    el.habitIdInput.value = habit.id;
    el.habitNameInput.value = habit.name;
    el.habitDescInput.value = habit.description || '';
    el.habitCategorySelect.value = habit.category || 'GENERAL';
    el.checkpointsListEditor.innerHTML = '';

    if (habit.checkpoints && habit.checkpoints.length > 0) {
      habit.checkpoints.forEach((cp, idx) => {
        el.checkpointsListEditor.appendChild(createCheckpointEditorRow(cp.title, idx + 1));
      });
    } else {
      el.checkpointsListEditor.appendChild(createCheckpointEditorRow('', 1));
    }

    el.habitModal.showModal();
    el.habitNameInput.focus();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    hideModalAlert();

    const name = el.habitNameInput.value.trim();
    const desc = el.habitDescInput.value.trim();
    const category = el.habitCategorySelect.value;
    const editingId = el.habitIdInput.value;

    if (!name) {
      showModalAlert('Habit name is required.');
      el.habitNameInput.focus();
      return;
    }

    // Gather checkpoints
    const checkpointInputs = el.checkpointsListEditor.querySelectorAll('.cp-editor-input');
    const checkpoints = [];

    checkpointInputs.forEach((input) => {
      const val = input.value.trim();
      if (val) {
        checkpoints.push({
          id: `cp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: val
        });
      }
    });

    if (checkpoints.length === 0) {
      showModalAlert('At least one checkpoint is required.');
      return;
    }

    if (editingId) {
      // Edit existing habit
      const existing = habits.find(h => String(h.id) === String(editingId));
      if (existing) {
        existing.name = name;
        existing.description = desc;
        existing.category = category;

        // Preserve matching checkpoint ids if unchanged, or attach new
        const updatedCheckpoints = checkpoints.map((newCp, idx) => {
          if (existing.checkpoints && existing.checkpoints[idx]) {
            return {
              id: existing.checkpoints[idx].id,
              title: newCp.title
            };
          }
          return newCp;
        });

        existing.checkpoints = updatedCheckpoints;
        updateHabitDayCompletion(existing, getTodayIso());
      }
    } else {
      // Create new habit
      const newHabit = {
        id: `h-${Date.now()}`,
        name: name,
        description: desc,
        category: category,
        createdAt: getTodayIso(),
        checkpoints: checkpoints,
        history: {
          [getTodayIso()]: {
            completedCheckpoints: [],
            completed: false
          }
        }
      };
      habits.push(newHabit);
    }

    saveData();
    el.habitModal.close();
    renderHabits();
    renderOverview();
    renderHistory();
  }

  // --------------------------------------------------------------------------
  // Data Export / Import / Reset
  // --------------------------------------------------------------------------
  function exportData() {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      habits: habits,
      dailyNotes: dailyNotes
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `habit_tracker_backup_${getTodayIso()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && Array.isArray(imported.habits)) {
          habits = imported.habits;
          if (imported.dailyNotes) dailyNotes = imported.dailyNotes;
          saveData();
          saveNotes();
          renderHabits();
          renderOverview();
          renderHistory();
          setupDailyNotes();
          alert('Habits backup restored successfully.');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function resetAllData() {
    if (confirm('Clear all habits, checkpoints, and history? This resets to initial demo state.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NOTES_STORAGE_KEY);
      habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
      dailyNotes = {};
      saveData();
      saveNotes();
      renderHabits();
      renderOverview();
      renderHistory();
      setupDailyNotes();
    }
  }

  // --------------------------------------------------------------------------
  // Keyboard Shortcuts (Section 16.4)
  // --------------------------------------------------------------------------
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input / textarea / select
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

      if (e.key === 'Escape') {
        if (el.habitModal.open) el.habitModal.close();
        if (el.confirmModal.open) el.confirmModal.close();
        return;
      }

      if (!isInput) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          openCreateModal();
        } else if (e.key === '?') {
          e.preventDefault();
          const help = document.querySelector('.keyboard-legend');
          if (help) {
            help.scrollIntoView({ behavior: 'smooth' });
            help.style.borderColor = 'var(--border-dark)';
            setTimeout(() => { help.style.borderColor = ''; }, 1000);
          }
        }
      }
    });
  }

  // Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --------------------------------------------------------------------------
  // Initialization & Event Binding
  // --------------------------------------------------------------------------
  function init() {
    loadData();
    updateDateHeader();
    setupDailyNotes();
    renderOverview();
    renderHabits();
    renderHistory();
    setupKeyboardShortcuts();

    // Event: Add checkpoint row inside modal
    el.btnAddCheckpointRow.addEventListener('click', () => {
      const nextIndex = el.checkpointsListEditor.querySelectorAll('.cp-editor-row').length + 1;
      const row = createCheckpointEditorRow('', nextIndex);
      el.checkpointsListEditor.appendChild(row);
      row.querySelector('.cp-editor-input').focus();
    });

    // Event: Open create modal
    el.btnNewHabitHeader.addEventListener('click', openCreateModal);
    el.btnNewHabitSection.addEventListener('click', openCreateModal);
    el.btnEmptyCreate.addEventListener('click', openCreateModal);

    // Event: Close modal
    el.btnModalClose.addEventListener('click', () => el.habitModal.close());
    el.btnModalCancel.addEventListener('click', () => el.habitModal.close());
    el.habitModal.addEventListener('click', (e) => {
      // Backdrop click closes dialog
      const rect = el.habitModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        el.habitModal.close();
      }
    });

    // Event: Form submit
    el.habitForm.addEventListener('submit', handleFormSubmit);

    // Event: Habits list interactions (checkpoints & actions)
    el.habitsList.addEventListener('click', (e) => {
      handleCheckpointsClick(e);
      handleHabitAction(e);
    });

    // Checkpoint keyboard navigation (Space / Enter on checkbox row)
    el.habitsList.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const row = e.target.closest('.checkpoint-row');
        if (row) {
          e.preventDefault();
          row.click();
        }
      }
    });

    // Category Filter Buttons
    el.categoryFilterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      el.categoryFilterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'ALL';
      renderHabits();
    });

    // Confirm Modal actions
    el.btnConfirmCancel.addEventListener('click', () => el.confirmModal.close());
    el.btnConfirmClose.addEventListener('click', () => el.confirmModal.close());
    el.btnConfirmDelete.addEventListener('click', () => {
      if (habitToDeleteId) {
        habits = habits.filter(h => String(h.id) !== String(habitToDeleteId));
        saveData();
        renderHabits();
        renderOverview();
        renderHistory();
        habitToDeleteId = null;
      }
      el.confirmModal.close();
    });

    // Backup & Reset Actions
    el.btnExportData.addEventListener('click', exportData);
    el.btnImportDataTrigger.addEventListener('click', () => el.fileImportInput.click());
    el.fileImportInput.addEventListener('change', handleImportFile);
    el.btnResetAll.addEventListener('click', resetAllData);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
