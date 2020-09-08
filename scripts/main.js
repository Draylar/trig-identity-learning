const QUESTION = document.getElementById("question");
const QUESTION_CATEGORY = document.getElementById("question-category");
const QUESTION_HINT = document.getElementById("question-hint");
const CURRENT_QUESTION = document.getElementById("current-question");
const PROGRESS_BAR = document.getElementById("progress");
const ANSWERS = document.getElementById("answers");
const SKIP = document.getElementById("skip");

const QUESTIONS_PER_CATEGORY = 10;

// Sound
const SUCCESS_SOUND = new Audio('sounds/success.wav')
const INCORRECT_SOUND = new Audio('sounds/incorrect.wav')
SUCCESS_SOUND.volume = .1;
INCORRECT_SOUND.volume = .75;

// Answer Form & Options
const ANSWER_FORM = document.getElementById("answer-form");
var currentAnswerElements = [];

var categories = []; // set of problem categories
var currentCategoryIndex = 0;
var currentQuestion; // current question
var correctId; // the element id of the answer to the current question

// current session statistics
var incorrect = 0;
var correct = 0;
var answered = 0;

/**
 * Right Triangle Definition
 * What is a trig function?
 */
categories.push({
    name: "Right triangle definition",
    details: "Assume that $0 < θ < π$ or $0° < θ < 90°$.",
    prefix: "What is the right triangle definition of",
    questions: [
        { prompt: "sinθ", answer: '$$\\dfrac{opposite}{hypotenuse}$$' },
        { prompt: "cosθ", answer: '$$\\dfrac{adjacent}{hypotenuse}$$' },
        { prompt: "tanθ", answer: '$$\\dfrac{opposite}{adjacent}$$' },
        { prompt: "cscθ", answer: '$$\\dfrac{hypotenuse}{opposite}$$' },
        { prompt: "secθ", answer: '$$\\dfrac{hypotenuse}{adjacent}$$' },
        { prompt: "cotθ", answer: '$$\\dfrac{adjacent}{opposite}$$' }
    ]
});

/**
 * Unit Circle Definition
 * How does a trig function work on a unit circle?
 */
categories.push({
    name: "Unit circle definition",
    details: "θ is any angle.",
    prefix: "What is the unit circle definition of",
    questions: [
        { prompt: "sinθ", answer: '$$\\dfrac{y}{1}$$' },
        { prompt: "cosθ", answer: '$$\\dfrac{x}{1}$$' },
        { prompt: "tanθ", answer: '$$\\dfrac{y}{x}$$' },
        { prompt: "cscθ", answer: '$$\\dfrac{1}{y}$$' },
        { prompt: "secθ", answer: '$$\\dfrac{1}{x}$$' },
        { prompt: "cotθ", answer: '$$\\dfrac{x}{y}$$' }
    ]
});

/**
 * Reciprocal Identities
 * What is the reciprocal (1/x) of a trig function?
 */
categories.push({
    name: "Reciprocal Identities",
    details: "",
    prefix: "What is the reciprocal identity of",
    questions: [
        { prompt: "sinθ", answer: '$$\\dfrac{1}{cscθ}$$' },
        { prompt: "cosθ", answer: '$$\\dfrac{1}{secθ}$$' },
        { prompt: "tanθ", answer: '$$\\dfrac{1}{cotθ}$$' },
        { prompt: "cscθ", answer: '$$\\dfrac{1}{sinθ}$$' },
        { prompt: "secθ", answer: '$$\\dfrac{1}{secθ}$$' },
        { prompt: "cotθ", answer: '$$\\dfrac{1}{cotθ}$$' }
    ]
});

/**
 * Pythagorean Identities
 */
categories.push({
    name: "Pythagorean Identities",
    details: "",
    prefix: "What is the equivalent of",
    questions: [
        { prompt: "$sin^2θ+cos^2θ$", answer: '$$1$$' },
        { prompt: "$tan^2θ+1$", answer: '$$sec^2θ$$' },
        { prompt: "$1+cot^2θ$", answer: '$$csc^2θ$$' },
    ]
});

/**
 * Even/Odd Formulas
 */
categories.push({
    name: "Even/Odd Formulas",
    details: "",
    prefix: "What is the equivalent of",
    questions: [
        { prompt: "$sin(-θ)$", answer: '$$-sinθ$$' },
        { prompt: "$cos(-θ)$", answer: '$$cosθ$$' },
        { prompt: "$tan(-θ)$", answer: '$$-tanθ$$' },
        { prompt: "$csc(-θ)$", answer: '$$-cscθ$$' },
        { prompt: "$sec(-θ)$", answer: '$$secθ$$' },
        { prompt: "$cot(-θ)$", answer: '$$-cotθ$$' }
    ]
});

/**
 * Periodic Formulas
 */
categories.push({
    name: "Periodic Formulas",
    details: "Assume n is an integer.",
    prefix: "What is the equivalent of",
    questions: [
        { prompt: "$sin(θ+2πn)$", answer: '$$sinθ$$' },
        { prompt: "$cos(θ+2πn)$", answer: '$$cosθ$$' },
        { prompt: "$tan(θ+πn)$", answer: '$$tanθ$$' },
        { prompt: "$csc(θ+2πn)$", answer: '$$csc$$' },
        { prompt: "$sec(θ+2πn)$", answer: '$$secθ$$' },
        { prompt: "$cot(θ+πn)$", answer: '$$cotθ$$' }
    ]
});

/**
 * Double Angle Formulas
 */
categories.push({
    name: "Double Angle Formulas",
    details: "",
    prefix: "What is the equivalent of",
    questions: [
        { prompt: "$sin(2θ)$", answer: '$$2sinθcosθ$$' },
        { prompt: "$cos(2θ)$", answer: '$$cos^2θ-sin^2θ$$' },
        { prompt: "$tan(2θ)$", answer: '$$\\dfrac{2tanθ}{1-tan^2θ}$$' }
    ]
});

/**
 * Double Angle Formulas
 */
categories.push({
    name: "Half Angle Formulas",
    details: "",
    prefix: "What is the equivalent of",
    questions: [
        { prompt: "$sin\\dfrac{θ}{2}$", answer: '$$±\\sqrt{\\dfrac{1-cosθ}{2}}$$' },
        { prompt: "$cos\\dfrac{θ}{2}$", answer: '$$±\\sqrt{\\dfrac{1+cosθ}{2}}$$' },
        { prompt: "$tan\\dfrac{θ}{2}$", answer: '$$±\\sqrt{\\dfrac{1-cosθ}{1+cosθ}}$$' }
    ]
});

/**
 * Sum and Difference Formulas
 */
categories.push({
    name: "Sum and Difference Formulas",
    details: "",
    prefix: "What is the equivalent of",
    questions: [
        { prompt: "$sin(\\alpha±\\beta)$", answer: '$$sin\\alpha cos\\beta±cos\\alpha sin\\beta$$' }
    ]
});

// todo: remove $$ from questions, add in manually when they are displayed?

// Add skip functionality
SKIP.addEventListener('click', event => {
    nextCategory();
});

// Load the first question
loadRandomQuestion(categories[0]);

/**
 * Loads a random question from the given category.
 * @param {*} category 
 */
function loadRandomQuestion(category) {
    ANSWERS.innerHTML = ""; // clear answer boxes
    currentAnswerElements = []; // clear current answers
    const lastQuestion = currentQuestion; // save current question

    // get random question
    if (lastQuestion === undefined) {
        currentQuestion = getRandomQuestion(category);
    } else {
        // don't allow the same question to appear twice in a row
        do {
            currentQuestion = getRandomQuestion(category);
        } while (lastQuestion.prompt == currentQuestion.prompt);
    }

    // set name, details, and the specific question
    QUESTION_CATEGORY.innerHTML = category.name; // Right triangle definition, ...
    QUESTION_HINT.innerHTML = "<i>" + category.details + "</i>"; // Assume that...
    CURRENT_QUESTION.innerHTML = `${category.prefix} ${currentQuestion.prompt}?`; // What is the ... of sin?

    // load random answer elements, max at 4
    const answerCount = Math.max(category.questions.length, 4);
    const usedAnswers = [];
    for (var i = 0; i < answerCount; i++) {
        addAnswer(category, i);
    }

    // set one answer to be correct
    var answerElement = currentAnswerElements[Math.floor(Math.random() * currentAnswerElements.length)];
    answerElement.innerHTML = currentQuestion.answer;
    correctId = answerElement.id;
}

function addAnswer(category, index) {
    const answer = document.createElement("p");
    answer.id = `answer-${index}`;
    answer.classList.add("answer");

    // Assign random answer 
    // TODO: do not allow duplicate elements
    answer.innerHTML = getRandomQuestion(category).answer;

    // Add click handler to the new element
    answer.addEventListener('click', event => {
        selectAnswer(event.target.id);
    });

    // Add new answer box
    ANSWERS.appendChild(answer);
    currentAnswerElements.push(answer);
}

function getRandomQuestion(category) {
    return category.questions[Math.floor(Math.random() * category.questions.length)];;
}

function selectAnswer(selectedId) {
    if (selectedId == correctId) {
        SUCCESS_SOUND.play(); // Play 'correct' sound
        PROGRESS_BAR.value += 1; // Increment progress bar by 1 (10%)

        // Apply "correct" class to the selected card for a moment
        // which causes it to gain a green background
        document.getElementById(selectedId).classList.add("correct");
        setTimeout(() => {
            document.getElementById(selectedId).classList.remove("correct");
            nextQuestion();
        }, 500);

        // Increment answer counters
        correct++;
        answered++;


    } else {
        INCORRECT_SOUND.play(); // Play the "incorrect" sound
        PROGRESS_BAR.value -= 1; // Decrement progress value by 1 (10%)

        // Apply "incorrect" class to the selected card for a moment
        // which causes it to gain a red background and a shaking effect
        document.getElementById(selectedId).classList.add("incorrect");
        setTimeout(() => {
            document.getElementById(selectedId).classList.remove("incorrect");
        }, 200);

        // Tally incorrect answer
        incorrect++;
        answered++;
    }
}

/**
 * Displays a new question.
 * 
 * If the user has obtained 100% on their progress in the current category,
 * a new category is selected. If there are no remaining categories,
 * the user wins the game (and play statistics are shown).
 */
function nextQuestion() {
    // check if we need to go to the next category
    if (PROGRESS_BAR.value >= QUESTIONS_PER_CATEGORY) {
        nextCategory();
    }

    // User hasn't finished the current category, move on to a new question.
    else {
        loadRandomQuestion(categories[currentCategoryIndex]);
        MathJax.typeset();
    }
}

function nextCategory() {
    currentCategoryIndex++;

    // If the user has reached the end of the current category,
    // and no categories remain after, display the win screen.
    if (currentCategoryIndex >= categories.length) {
        finish();
    }

    // A new category is available, switch to it.
    else {
        loadRandomQuestion(categories[currentCategoryIndex]);
        PROGRESS_BAR.value = 0;
        MathJax.typeset();
    }
}

function finish() {
    if (answered == 0) {
        QUESTION.innerHTML = `
            <p>You didn't answer any questions, but seeking out knowledge is great, so you still win!</p>
            <p>If you need help studying Trig Identities, check out the <a href="https://tutorial.math.lamar.edu/pdf/Trig_Cheat_Sheet.pdf">Trig Cheat Sheet</a>.</p>
        `;
    }

    else {
        QUESTION.innerHTML = `
                <p>You win! Thanks for playing.</p>
                <p>You answered ${answered} questions, ${correct} of which you got right, and ${incorrect} of which were wrong.</p>
                <p>That's ${(correct / answered).toFixed(2) * 100}% accuracy!</p>
            `;
    }

    QUESTION_CATEGORY.style.display = 'none';
    SKIP.style.display = 'none';

    // create refresh button
    const refresh = document.createElement("button");
    refresh.innerHTML = "Restart";
    refresh.classList.add('button-primary');
    QUESTION.appendChild(refresh); // add element to page
    refresh.addEventListener('click', event => {
        window.location.reload();
    });
}
