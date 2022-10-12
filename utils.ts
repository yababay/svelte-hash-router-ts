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

function getSignificantSections() { 
    return Array.from(document.querySelectorAll('#significant > section'))
}

function getSignificantHashes() { 
    return getSignificantSections().map(section => `#${section.getAttribute('id') || section.getAttribute("data-proxy")}`)
}

async function showSection(target: string | Element, proxies: object){
    target = assureElement(target)
    let id = target.getAttribute('id')
    if(!id){
        id = target.getAttribute('data-proxy')
        if(!id) throw Error('В этом наборе недопустимы секции без идентификатора или прокси.')
        const constructor = Reflect.get(proxies, id)
        if(!constructor) throw Error(`Не найден конструктов для секции с id=${id}`)
        target.setAttribute('id', id)
        Reflect.set(proxies, id, Reflect.construct(constructor, [{target}]))
    }
    const component = Reflect.get(proxies, id)
    if(component){
        const loader = Reflect.get(component, 'loader')
        if(loader){
            await loadContent(loader)
        }
    }
    hideSections()
    showElement(target)
}

function idFromHash(hash: string, defaultId: string = 'intro'): string{
    if(!getSignificantHashes().includes(hash)) return defaultId
    return hash.substring(1)
}

function hideSections(){
    getSignificantSections().forEach(hideElement)
}

function hideElement(element: Element){
    element.classList.add('d-none')
}

function showElement(element: Element){
    element.classList.remove('d-none')
}
  
function assureElement(element: string | Element): Element{
    if(element instanceof Element) return element
    let target = getSignificantSections().find(section => section.getAttribute('id') === element || section.getAttribute('data-proxy') === element)
    if(!target )  throw 'Не удалось найти секцию по идентификатору.'
    return  target
}

export { idFromHash, showSection, hideElement, showElement, assureElement, delayedAction }
