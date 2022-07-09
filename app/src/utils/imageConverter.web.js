export async function tryConvertToWebP(dataURI, quality) {
  // This check is important, the canvas conversion code fails on some browsers
  // if fed a webp image.
  if (dataURI.startsWith('data:image/webp;'))
    return new Promise(resolve => resolve(dataURI))
  function convert() {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        canvas.getContext('2d').drawImage(image, 0, 0)
        resolve(canvas.toDataURL('image/webp', quality))
      }
      image.onerror = reject
      image.src = dataURI
    })
  }
  return await convert()
}
export default tryConvertToWebP

export async function tryConvertToJpeg(dataURI, quality) {
  // This check is important, the canvas conversion code fails on some browsers
  // if fed a webp image.
  if (dataURI.startsWith('data:image/jpeg;'))
    return new Promise(resolve => resolve(dataURI))
  function convert() {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        canvas.getContext('2d').drawImage(image, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      image.onerror = reject
      image.src = dataURI
    })
  }
  return await convert()
}
