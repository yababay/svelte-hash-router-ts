import { derived, writable } from "svelte/store"
import {  idFromHash, showSection, hideElement, showElement, assureElement, showLoader, hideLoader  } from './utils'

const hash = writable('')
const hashWithParams = derived(hash, $hash => {
    if(!$hash.includes('?')) return $hash
    const [hash, query] = $hash.split('?')
    const props = Object.fromEntries(new URLSearchParams(query).entries())
    return {hash, props}
})

let lastURL: string 

function setupRouter(proxies: object, selector: string) {
    Object.keys(proxies).forEach(key => proxies[key] = {constructor: proxies[key]})
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
    hashWithParams.subscribe($hash => {
      if(typeof $hash !== 'string') return
      const id = idFromHash($hash, selector)
      showSection(id, proxies, selector)
    })
}

export { hash, hashWithParams, setupRouter, idFromHash, showSection, hideElement, showElement, assureElement, showLoader, hideLoader }

