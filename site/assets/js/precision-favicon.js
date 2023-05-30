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
})()
