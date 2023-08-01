(() => {
  'use strict'
  for (const link of document.querySelectorAll('[rel*=icon]:not([rel=mask-icon])')) {
    const icon = Object.assign(
      new Image(),
      {
        async onload() {
          const canvas = new OffscreenCanvas(...['width', 'height'].map(wh => icon[wh]))
          const ctx = canvas.getContext('2d')
          ctx.filter = 'hue-rotate(220deg)'
          ctx.drawImage(icon, 0, 0)
          link.href = URL.createObjectURL(await canvas.convertToBlob())
        },
        src: link.href
      }
    )
  }

  for (
    const color of document.querySelectorAll(`
      div[class*=swatch] ~ *,
      .row > * > .rounded-3,
      .table-swatches .rounded-2:not([style*="-border-subtle)"])
    `)
  ) {
    color.className += ' d-flex align-items-center justify-content-between'
    const { backgroundColor } = getComputedStyle(color)
    const RGB_BASE = 256
    const numbers = [...backgroundColor.matchAll(/[\d.]+/g)].map(([n], i) =>
      i === 3 ? n * RGB_BASE : Number(n)
    )
    color.innerHTML += `
      <span
        class='
          font-monospace
          ${/* eslint-disable indent */
            color.classList.contains('rounded-2') && numbers.reduce((a, b) => a + b) / 3 < RGB_BASE / 2 ?
              'text-white' :
              ''
          /* eslint-enable indent */}
        '
        style='font-size: .75rem;'
      >
        #${numbers.map(n => n.toString(16).padStart(2, 0)).join('')}
      </span>
    `
  }
})()
