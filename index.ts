import { derived, writable } from "svelte/store"
import Router from './router'

const hash = writable('')
const hashWithParams = derived(hash, $hash => {
    if(!$hash.includes('?')) return $hash
    const [hash, query] = $hash.split('?')
    const props = Object.fromEntries(new URLSearchParams(query).entries())
    return {hash, props}
})

let lastURL: string 

async function setupRouter(proxies: object, selector: string, logoTimeout = 4000, defaultId = 'intro') {
    const router = new Router(proxies, selector, defaultId)
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
    hashWithParams.subscribe(async $hash => {
      Router.hideLoader()
      if(typeof $hash === 'string'){
        const id = router.idFromHash($hash)
        await router.showSection(id)
        return
      }
      const {hash, props} = $hash
      const id = router.idFromHash(hash)
      await router.showSection(id, props)
    })
    if(logoTimeout){
      Router.showLoader()
      await Router.delayedAction(logoTimeout)
      Router.hideLoader()
    }
    hash.set(window.location.hash)
    return router
}

export { hash, hashWithParams, setupRouter, Router }
