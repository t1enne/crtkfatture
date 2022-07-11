// cl can operate on classList, or work as querySelector
const cl = (input: string | HTMLElement | HTMLElement[], action?: string, classname?: string) => {
  let nodeArray: HTMLElement[] = []

  if (typeof input === "string") nodeArray = Array.from(document.querySelectorAll(input))
  else if (input.constructor === [].constructor) nodeArray = input as HTMLElement[]
  else if (input instanceof HTMLElement) nodeArray.push(input)
  else input ? Array.from(input) : []

  if (action && classname) {
    nodeArray.forEach(element => element && element.classList[action](classname))
  }
  if (nodeArray.length === 0) return null
  else if (nodeArray.length === 1) return nodeArray[0]
  
  return nodeArray
}


const setAttributes = (selector: string, attributes: {
  [attr: string]: string | boolean | number
}) => {
  const htmlElement = cl(selector)
  if (!htmlElement) return
    if (htmlElement.hasOwnProperty('forEach')) {
      // array
      (htmlElement as HTMLElement[]).forEach((elem) => {
        for (const attribute in attributes) {
          const val = attributes[attribute]
          if (val === false) elem.removeAttribute(attribute)
            elem.setAttribute(attribute, String(val))
        }
      })
    }

    for (const attribute in attributes) {
      const val = attributes[attribute]
      if (val === false) {
        (htmlElement as HTMLElement).removeAttribute(attribute)
      } else (htmlElement as HTMLElement).setAttribute(attribute, String(val))
    }
}

export { cl, setAttributes };
