import { derived, writable, type Writable, type Readable } from 'svelte/store'

let significantSections: Element[]
let significantIds: string[]
let lastURL: string

function idFromHash(hash: string, intro: string): string{
  let target = hash ? hash.trim() : ''
  if(!target) target = window.location.hash
  if(target.startsWith('#')) target = target.substring(1)
  if(hash.includes('?')) target = target.substring(0, target.indexOf('?'))
  if(!significantIds.includes(target)) throw Error(`Не найдена секция с id=${target}`)
  return target
}

function findSection(id: string): Element{
  return significantSections.find(el => el.getAttribute('id') === id)
}

interface Propsable {
  target: Element
  props: object
}

interface HashAndPropsable {
  hash: Writable<string>
  props: Readable<Propsable>
}

export default function (selector = 'main > section', intro = 'intro', hider = 'd-none'): HashAndPropsable {
  const hash = writable('')
  const props = derived(hash, $hash => {
    try{
      let id = idFromHash($hash, intro)
      const [_, query] = [...$hash.split('?'), '']
      const target = findSection(id)
      const props = Object.fromEntries(new URLSearchParams(query).entries())
      return {target, props}
    }
    catch(e){
      return {target: findSection(intro), props: {}}
    }
  })
  significantSections = Array.from(document.querySelectorAll(selector))
  significantIds = significantSections.map(el => el.getAttribute('id'))
  window.addEventListener('hashchange', function (event) {
    Object.defineProperty(event, 'oldURL', {
      enumerable: true,
      configurable: true,
      value: lastURL,
    });
    Object.defineProperty(event, 'newURL', {
      enumerable: true,
      configurable: true,
      value: document.URL,
    });
    lastURL = document.URL
    hash.set(window.location.hash)
  })
  hash.subscribe($hash => {
    try {
      const id = idFromHash($hash, intro)
      significantSections.forEach(el => el.classList.add(hider))    
      const section = findSection(id)
      section.classList.remove(hider)
    }
    catch(e){
      //console.log(e)
      window.location.hash = `#${intro}`
    }
  })
  hash.set(window.location.hash)
  return {hash, props}
}
