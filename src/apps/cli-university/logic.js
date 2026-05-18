// Pure logic extracted from CLI_uni.html for testability.
// The HTML file implements these inline; this module mirrors them for tests.

function getProgress(storage) {
    try { return JSON.parse(storage.getItem('cli-uni-progress')) || {}; }
    catch { return {}; }
}

function saveProgress(storage, progress) {
    storage.setItem('cli-uni-progress', JSON.stringify(progress));
}

function markCompleted(storage, topic, lesson) {
    const progress = getProgress(storage);
    progress[`${topic}.${lesson}`] = { completed: true, timestamp: Date.now() };
    saveProgress(storage, progress);
    return progress;
}

function calcProgressPct(storage, allLessons) {
    const progress = getProgress(storage);
    const done = allLessons.filter(l => progress[`${l.topic}.${l.lesson}`]?.completed).length;
    return Math.round((done / allLessons.length) * 100);
}

function setLastLesson(storage, topic, lesson) {
    const progress = getProgress(storage);
    progress._lastLesson = { topic, lesson };
    saveProgress(storage, progress);
}

function getLastLesson(storage) {
    return getProgress(storage)._lastLesson || null;
}

function scoreQuiz(questions, answers) {
    return questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
}

function quizPassed(score, total, threshold = 0.7) {
    return total > 0 && score / total >= threshold;
}

module.exports = {
    getProgress, saveProgress, markCompleted, calcProgressPct,
    setLastLesson, getLastLesson, scoreQuiz, quizPassed,
};
