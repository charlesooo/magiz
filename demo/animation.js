const r1 = 4
const r2 = 2.15

const ta1 = anime({
  targets: ['#t1'],
  translateX: [0, 30],
  autoplay: false,
})

function setTexts() {
  const ww = window.innerWidth
  const wh = window.innerHeight
  const h1 = (wh * r2) / (r1 + r2)
  const h2 = (wh * r1) / (r1 + r2)
  const tw = h1 * r1
  const ml = ww / 2 - tw / 2
  anime.set('#mask', { 'transform-origin': '50% 40%' })
  anime.set('#t1', { height: h1, x: ml })
  anime.set('#t2', { height: h2, x: ml, y: h1 })
  anime({
    targets: ['#t1'],
    translateX: [-tw - ml, 0],
  })
  anime({
    targets: ['#t2'],
    translateX: [tw + ml, 0],
    delay: 200,
  })
}

window.addEventListener('resize', setTexts)

setTexts()

const maskEl = document.getElementById('mask')
const scaleText = anime({
  targets: '#mask',
  scale: 99,
  duration: 1000,
  easing: 'easeInSine',
  autoplay: false,
  changeComplete() {
    if (anime.get(maskEl, 'scale') === '99') {
      maskEl.style.pointerEvents = 'none'
    } else {
      maskEl.style.pointerEvents = 'all'
    }
  },
})

toggleScale()

function toggleScale() {
  const s = anime.get(maskEl, 'scale')
  if (s === '1' || s === '99') {
    scaleText.reverse()
    scaleText.play()
  }
}
