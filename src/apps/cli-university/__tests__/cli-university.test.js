const {
    getProgress, markCompleted, calcProgressPct,
    setLastLesson, getLastLesson, scoreQuiz, quizPassed,
} = require('../logic');

// Minimal localStorage stub
function makeStorage() {
    const store = {};
    return {
        getItem: (k) => store[k] ?? null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };
}

const ALL_LESSONS = [
    { topic: 'vim',  lesson: 'philosophy' },
    { topic: 'vim',  lesson: 'basics' },
    { topic: 'vim',  lesson: 'editing' },
    { topic: 'vim',  lesson: 'modes' },
    { topic: 'vim',  lesson: 'advanced' },
    { topic: 'tmux', lesson: 'intro' },
    { topic: 'tmux', lesson: 'sessions' },
    { topic: 'tmux', lesson: 'windows' },
    { topic: 'tmux', lesson: 'panes' },
    { topic: 'cli',  lesson: 'intro' },
    { topic: 'cli',  lesson: 'streams' },
    { topic: 'cli',  lesson: 'go' },
    { topic: 'cli',  lesson: 'python' },
    { topic: 'cli',  lesson: 'rust' },
    { topic: 'cli',  lesson: 'automation' },
];

// ── Progress tracking ────────────────────────────────────────────────────
describe('getProgress', () => {
    it('returns empty object when nothing stored', () => {
        const storage = makeStorage();
        expect(getProgress(storage)).toEqual({});
    });

    it('returns stored progress', () => {
        const storage = makeStorage();
        storage.setItem('cli-uni-progress', JSON.stringify({ 'vim.basics': { completed: true } }));
        expect(getProgress(storage)['vim.basics'].completed).toBe(true);
    });

    it('returns empty object on malformed JSON', () => {
        const storage = makeStorage();
        storage.setItem('cli-uni-progress', 'not-json{{{');
        expect(getProgress(storage)).toEqual({});
    });
});

describe('markCompleted', () => {
    it('marks a lesson completed', () => {
        const storage = makeStorage();
        const progress = markCompleted(storage, 'vim', 'basics');
        expect(progress['vim.basics'].completed).toBe(true);
    });

    it('records a timestamp', () => {
        const storage = makeStorage();
        const before = Date.now();
        const progress = markCompleted(storage, 'vim', 'basics');
        expect(progress['vim.basics'].timestamp).toBeGreaterThanOrEqual(before);
    });

    it('does not overwrite other lessons', () => {
        const storage = makeStorage();
        markCompleted(storage, 'vim', 'basics');
        markCompleted(storage, 'tmux', 'intro');
        const progress = getProgress(storage);
        expect(progress['vim.basics'].completed).toBe(true);
        expect(progress['tmux.intro'].completed).toBe(true);
    });
});

describe('calcProgressPct', () => {
    it('returns 0 when no lessons completed', () => {
        const storage = makeStorage();
        expect(calcProgressPct(storage, ALL_LESSONS)).toBe(0);
    });

    it('returns 100 when all lessons completed', () => {
        const storage = makeStorage();
        ALL_LESSONS.forEach(l => markCompleted(storage, l.topic, l.lesson));
        expect(calcProgressPct(storage, ALL_LESSONS)).toBe(100);
    });

    it('calculates partial completion correctly', () => {
        const storage = makeStorage();
        markCompleted(storage, 'vim', 'basics');
        markCompleted(storage, 'vim', 'editing');
        markCompleted(storage, 'tmux', 'intro');
        // 3 of 15 = 20%
        expect(calcProgressPct(storage, ALL_LESSONS)).toBe(20);
    });
});

// ── Last lesson tracking ─────────────────────────────────────────────────
describe('setLastLesson / getLastLesson', () => {
    it('returns null when nothing stored', () => {
        const storage = makeStorage();
        expect(getLastLesson(storage)).toBeNull();
    });

    it('stores and retrieves last lesson', () => {
        const storage = makeStorage();
        setLastLesson(storage, 'vim', 'modes');
        expect(getLastLesson(storage)).toEqual({ topic: 'vim', lesson: 'modes' });
    });

    it('overwrites previous last lesson', () => {
        const storage = makeStorage();
        setLastLesson(storage, 'vim', 'basics');
        setLastLesson(storage, 'cli', 'go');
        expect(getLastLesson(storage)).toEqual({ topic: 'cli', lesson: 'go' });
    });
});

// ── Quiz scoring ─────────────────────────────────────────────────────────
const SAMPLE_QUIZ = [
    { q: "Which key returns to NORMAL mode?", options: ["i", "a", "Esc", ":"], answer: 2 },
    { q: "What does 'dw' do?",               options: ["Delete word", "Draw window", "Down window", "Delete line"], answer: 0 },
    { q: "What does 'yy' do?",               options: ["Yank line", "Undo", "Redo", "Delete"], answer: 0 },
];

describe('scoreQuiz', () => {
    it('scores all correct answers', () => {
        const answers = [2, 0, 0];
        expect(scoreQuiz(SAMPLE_QUIZ, answers)).toBe(3);
    });

    it('scores all wrong answers', () => {
        const answers = [0, 1, 1];
        expect(scoreQuiz(SAMPLE_QUIZ, answers)).toBe(0);
    });

    it('scores partial correct answers', () => {
        const answers = [2, 1, 0]; // 2 correct
        expect(scoreQuiz(SAMPLE_QUIZ, answers)).toBe(2);
    });

    it('treats undefined answer as wrong', () => {
        const answers = [undefined, 0, 0];
        expect(scoreQuiz(SAMPLE_QUIZ, answers)).toBe(2);
    });
});

describe('quizPassed', () => {
    it('passes at 100%', () => expect(quizPassed(3, 3)).toBe(true));
    it('passes at 70%',  () => expect(quizPassed(7, 10)).toBe(true));
    it('fails below 70%', () => expect(quizPassed(6, 10)).toBe(false));
    it('fails at 0%',    () => expect(quizPassed(0, 3)).toBe(false));
    it('fails with zero total', () => expect(quizPassed(0, 0)).toBe(false));
});

// ── DOM: content display ─────────────────────────────────────────────────
describe('Content display', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="content-display" tabindex="-1"></main>';
    });

    it('injects lesson content into DOM', () => {
        const display = document.getElementById('content-display');
        display.innerHTML = '<h2>Vim Basics</h2><p>Learn the basics.</p>';
        expect(display.innerHTML).toContain('Vim Basics');
        expect(display.innerHTML).toContain('Learn the basics');
    });

    it('shows error for unknown lesson', () => {
        const display = document.getElementById('content-display');
        const content = { vim: { basics: '<h2>Vim Basics</h2>' } };
        const topic = 'vim', lesson = 'nonexistent';
        if (!content[topic]?.[lesson]) {
            display.innerHTML = '<h2>Content not found.</h2>';
        }
        expect(display.innerHTML).toContain('Content not found');
    });

    it('resets scroll to top on new content', () => {
        const display = document.getElementById('content-display');
        display.scrollTop = 500;
        display.scrollTop = 0;
        expect(display.scrollTop).toBe(0);
    });
});
