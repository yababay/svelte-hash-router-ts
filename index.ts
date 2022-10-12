import { writable } from "svelte/store"
import {  idFromHash, showSection, hideElement, showElement, assureElement  } from './utils'

const hash = writable('')
let lastURL: string 

function setupRouter(proxies: object) {
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
      const id = idFromHash($hash)
      showSection(id, proxies)
    })
}

export { hash, setupRouter, idFromHash, showSection, hideElement, showElement, assureElement }
