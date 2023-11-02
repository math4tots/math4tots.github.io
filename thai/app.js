// Registering Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/thai/serviceworker.js');
}

/**
 * @typedef {{
 *   thai: string,
 *   phon: string,
 *   en: string,
 * }} WordEntry
 */

const CORRECT_COLOR_CLASS = "mdl-color--light-green-A400";
const INCORRECT_COLOR_CLASS = "mdl-color--red-A400";

window.onload = async () => {
  /** @type {WordEntry[]} */
  const words = await (await fetch("words.json")).json();

  /** @type {HTMLElement} */
  const prompt = document.getElementById("prompt");

  /** @type {HTMLElement} */
  const hint = document.getElementById("hint");

  /** @type {HTMLElement[]} */
  const choices = [
    document.getElementById("choice-1"),
    document.getElementById("choice-2"),
    document.getElementById("choice-3"),
    document.getElementById("choice-4"),
  ];

  for (let i = 0; i < 4; i++) {
    const capturedI = i;
    choices[capturedI].onclick = () => onClick(capturedI);
  }

  /** @type {number[]} */
  let indices = [0, 0, 0, 0];
  let correctWordIndexIndex = 0;
  let userMadeChoice = false;

  /**
   * @returns {WordEntry}
   */
  function getCorrectWord() {
    return words[indices[correctWordIndexIndex]];
  }

  hint.onclick = async function () { await showHint(); };

  async function showHint() {
    hint.innerText = getCorrectWord().phon;
  }

  async function startNewPrompt() {
    userMadeChoice = false;
    indices = chooseIndices(words.length, 4);
    correctWordIndexIndex = Math.floor(Math.random() * indices.length);
    const correctWordIndex = indices[correctWordIndexIndex];
    const word = words[correctWordIndex];

    // Remove any colored element classes
    for (const choice of choices) {
      choice.classList.remove(CORRECT_COLOR_CLASS);
      choice.classList.remove(INCORRECT_COLOR_CLASS);
    }

    hint.innerText = "[click for hint]";
    prompt.innerText = word.thai;

    for (let i = 0; i < 4; i++) {
      const word = words[indices[i]];
      choices[i].innerText = word.en;
    }
  }

  /**
   * @param {number} i
   */
  async function onClick(i) {
    // If the user has already made a choice, then start a new prompt
    if (userMadeChoice) {
      return await startNewPrompt();
    }
    userMadeChoice = true;

    // otherwise, show the user whether they made the correct
    // choice or not
    choices[correctWordIndexIndex].classList.add(CORRECT_COLOR_CLASS);
    if (i !== correctWordIndexIndex) {
      choices[i].classList.add(INCORRECT_COLOR_CLASS);
    }

    // When showing the answer, also show the hint
    showHint();
  }

  await startNewPrompt();
};

/**
 * For an array of size n, selects k distinct valid indices
 * @param {number} n
 * @param {number} k
 * @returns {number[]}
 */
function chooseIndices(n, k) {
  if (k > n || k < 0) {
    throw new Error(`Cannot choose ${k} from ${n} choices`);
  }
  /** @type {number[]} */
  const choices = [];
  while (choices.length < k) {
    const choice = Math.floor(Math.random() * n);
    let alreadyIncluded = false;
    for (let oldChoice of choices) {
      if (oldChoice === choice) {
        alreadyIncluded = true;
        break;
      }
    }
    if (!alreadyIncluded) {
      choices.push(choice);
    }
  }
  return choices;
}
