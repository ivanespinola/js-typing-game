import { words as INITIAL_WORDS } from "./data.js"

const $time = document.querySelector("time")
const $paragraph = document.querySelector("p")
const $input = document.querySelector("input")
const $game = document.querySelector("#game")
const $results = document.querySelector("#results")
const $wpm = $results.querySelector("#results-wpm")
const $accuracy = $results.querySelector("#results-accuracy")
const $button = document.querySelector("#reload-button")

const INITIAL_TIME = 3

let words = []
let currentTime = INITIAL_TIME
let isPlaying

function initGame() {
  $game.style.display = "flex"
  $results.style.display = "none"
  $input.value = ""
  isPlaying = false

  words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 50)

  currentTime = INITIAL_TIME

  $time.textContent = currentTime

  $paragraph.innerHTML = words
    .map((word, index) => {
      const letters = word.split("")

      return `<x-word> ${letters
        .map((letter) => `<x-letter>${letter}</x-letter>`)
        .join("")}</x-word>`
    })
    .join("")

  const $firstWord = $paragraph.querySelector("x-word")
  $firstWord.classList.add("active")
  $firstWord.querySelector("x-letter").classList.add("active")
}

function onKeyDown(event) {
  const $currentWord = $paragraph.querySelector("x-word.active")
  const $currentLetter = $currentWord.querySelector("x-letter.active")
  const { key } = event

  if (key === " ") {
    event.preventDefault()

    const $nextWord = $currentWord.nextElementSibling
    const $nextLetter = $nextWord.querySelector("x-letter")

    $currentWord.classList.remove("active", "marked")
    $currentLetter.classList.remove("active")

    $nextWord.classList.add("active")
    $nextLetter.classList.add("active")
    $input.value = ""

    const hasMissedLetters =
      $currentWord.querySelectorAll("x-letter:not(.correct)").length > 0

    const classToAdd = hasMissedLetters ? "marked" : "correct"
    $currentWord.classList.add(classToAdd)

    return
  }

  if (key === "Backspace") {
    const $prevWord = $currentWord.previousElementSibling
    const $prevLetter = $currentLetter.previousElementSibling

    if (!$prevWord && !$prevLetter) {
      event.preventDefault()
      return
    }

    const $wordMarked = $paragraph.querySelector("x-word.marked")
    if ($wordMarked && !$prevLetter) {
      event.preventDefault()
      $prevWord.classList.remove("marked")
      $prevWord.classList.add("active")

      const $letterToGo = $prevWord.querySelector("x-letter:last-child")

      $currentLetter.classList.remove("active")
      $letterToGo.classList.add("active")

      $input.value = [
        ...$prevWord.querySelectorAll("x-letter.correct, x-letter.incorrect"),
      ]
        .map(($el) => {
          return $el.classList.contains("correct") ? $el.innerText : "*"
        })
        .join("")
    }
  }
}

function onKeyUp() {
  const $currentWord = $paragraph.querySelector("x-word.active")
  const $currentLetter = $currentWord.querySelector("x-letter.active")

  const currentWord = $currentWord.innerText.trim()
  $input.maxLength = currentWord.length

  const $allLetters = $currentWord.querySelectorAll("x-letter")
  $allLetters.forEach(($letter) =>
    $letter.classList.remove("correct", "incorrect")
  )

  $input.value.split("").forEach((char, index) => {
    const $letter = $allLetters[index]
    const letterToCheck = currentWord[index]
    const isCorrect = char === letterToCheck
    const letterClass = isCorrect ? "correct" : "incorrect"
    $letter.classList.add(letterClass)
  })

  $currentLetter.classList.remove("active", "is-last")
  const inputLength = $input.value.length
  const $nextActiveLetter = $allLetters[inputLength]

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add("active")
  } else {
    $currentLetter.classList.add("active", "is-last")
  }
}

function initEvents() {
  document.addEventListener("keydown", () => {
    $input.focus()
    if (!isPlaying) {
      isPlaying = true
      const intervalId = setInterval(() => {
        currentTime--
        $time.textContent = currentTime

        if (currentTime === 0) {
          clearInterval(intervalId)
          gameOver()
        }
      }, 1000)
    }
  })
  $input.addEventListener("keydown", onKeyDown)
  $input.addEventListener("keyup", onKeyUp)
  $button.addEventListener("click", initGame)
}

function gameOver() {
  $game.style.display = "none"
  $results.style.display = "flex"

  const correctWords = $paragraph.querySelectorAll("x-word.correct").length
  const correctLetter = $paragraph.querySelectorAll("x-letter.correct").length
  const incorrectLetter =
    $paragraph.querySelectorAll("x-letter.incorrect").length

  const totalLetters = correctLetter + incorrectLetter
  const accuracy = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0
  const wpm = (correctWords * 60) / INITIAL_TIME

  $wpm.textContent = wpm
  $accuracy.textContent = `${accuracy.toFixed(2)}%`
}

initGame()
initEvents()
