const headerMainFooter = Array.from(document.querySelectorAll('header, main, footer'))
const loaderSection = document.getElementById('loader')

function showLoader(){
    headerMainFooter.forEach(hideElement)
    if(loaderSection instanceof Element) showElement(loaderSection)
}

function hideLoader(){
    if(loaderSection instanceof Element) hideElement(loaderSection)
    headerMainFooter.forEach(showElement)
}

async function loadContent(loading: CallableFunction = () => delayedAction(4)){
    showLoader()
    await loading()
    hideLoader()
}

function delayedAction (delay: number, func: CallableFunction = ()=> true): Promise<boolean>{
    return new Promise((yep) => setTimeout(() => yep(func()), delay))
}

function getSignificantSections(selector) { 
    return Array.from(document.querySelectorAll(selector))
}

function getSignificantHashes(selector) { 
    return getSignificantSections(selector).map(section => `#${section.getAttribute('id') || section.getAttribute("data-proxy")}`)
}

async function showSection(target: string | Element, proxies: object, selector: string, props: object = {}){
    target = assureElement(target, selector)
    const force = target.getAttribute('data-force')
    if(force && force === 'true'){
        target.removeAttribute('id')
        target.innerHTML = ''
    }
    let id = target.getAttribute('id')
    if(!id){
        id = target.getAttribute('data-proxy')
        if(!id) throw Error('В этом наборе недопустимы секции без идентификатора или прокси.')
        const proxy = Reflect.get(proxies, id)
        if(!proxy) throw Error(`Не найден конструктов для секции с id=${id}`)
        const {constructor} = proxy
        target.setAttribute('id', id)
        const instance = Reflect.construct(constructor, [{target, props}]) //Reflect.set(proxies, id, Reflect.construct(constructor, [{target, props}]))
        Reflect.set(proxies, id, {constructor, instance})
    }
    const component = Reflect.get(proxies, id)
    if(component){
        const {instance} = component
        const loader = Reflect.get(instance, 'loader')
        if(loader){
            await loadContent(loader)
        }
    }
    hideSections(selector)
    showElement(target)
}

function idFromHash(hash: string, selector, defaultId: string = 'intro'): string{
    if(!getSignificantHashes(selector).includes(hash)) return defaultId
    return hash.substring(1)
}

function hideSections(selector){
    getSignificantSections(selector).forEach(hideElement)
}

function hideElement(element: Element){
    element.classList.add('d-none')
}

function showElement(element: Element){
    element.classList.remove('d-none')
}
  
function assureElement(element: string | Element, selector): Element{
    if(element instanceof Element) return element
    let target = getSignificantSections(selector).find(section => section.getAttribute('id') === element || section.getAttribute('data-proxy') === element)
    if(!target )  throw 'Не удалось найти секцию по идентификатору.'
    return  target
}

export { idFromHash, showSection, hideElement, showElement, assureElement, delayedAction, showLoader, hideLoader }
