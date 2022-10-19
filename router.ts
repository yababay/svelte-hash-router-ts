const headerMainFooter = Array.from(document.querySelectorAll('header, main, footer'))
const loaderSection = document.getElementById('loader')
let proxies: Map<Element, Sveltable>
let that: Router

type Loadable = () => Promise<void>

interface Showable {
    onShow: Loadable
}

interface Hidable {
    onHide: Loadable
}

interface Sveltable extends Showable, Hidable {
    constructor: any
    instance: any
}

function wrapProxy(proxy: any): Sveltable{
    const constructor = proxy
    const instance = null;
    const onShow = async ()=> Promise.resolve()
    const onHide = async ()=> Promise.resolve()
    return {constructor, instance, onHide, onShow}
}

function wrapInctance(wrapper: Sveltable, target: Element, props: object = {}): Sveltable {
    let {constructor, onShow, onHide} = wrapper
    const instance = Reflect.construct(constructor, [{target, props}])
    if(Reflect.has(instance, 'onShow')) onShow = instance.onShow
    if(Reflect.has(instance, 'onHide')) onHide = instance.onHide
    return { constructor, instance, onShow, onHide }
}

export default class Router {

    #selector: string
    #defaultId: string

    constructor(_proxies: object, selector: string, defaultId: string){
        this.#selector = selector
        this.#defaultId = defaultId
        proxies = new Map(
            Object.entries(_proxies)
                .map(([key, value]) => {
                    const section = this.assureElement(key)
                    const proxy = wrapProxy(value)
                    return [section, proxy]
                })
        )
        that = this
    }

    async showSection(value: string | Element, props: object = {}){
        await that.hideSections()
        const section = that.assureElement(value)
        const force = section.getAttribute('data-force')
        if(force && force === 'true'){
            section.removeAttribute('id')
            section.innerHTML = ''
        }    
        let id = section.getAttribute('id')
        if(!id){
            id = section.getAttribute('data-proxy')
            if(!id) throw Error('В этом наборе недопустимы секции без идентификатора или прокси.')
            const proxy = proxies.get(section)
            if(!proxy) throw Error(`Не найден конструктов для секции с id=${id}`)
            section.setAttribute('id', id)
            const update = wrapInctance(proxy, section, props)
            proxies.set(section, update)
        }
        const proxy = proxies.get(section)
        if(proxy){
            await proxy.onShow()
        }
        Router.showElement(section)
    }

    async hideSection(section: Element){
        const proxy = proxies.get(section)
        if(proxy){
            const {onHide} = proxy
            await onHide()
        }
        Router.hideElement(section)
    }

    async hideSections(){
        await Promise.all(
            that.significantSections.map(that.hideSection)
        )
    }
  
    assureElement(value: string | Element): Element{
        if(value instanceof Element) return value
        let target = this.significantSections.find(section => section.getAttribute('id') === value || section.getAttribute('data-proxy') === value)
        if(!target )  throw 'Не удалось найти секцию по идентификатору.'
        return target
    }

    idFromHash(hash: string): string{
        if(!this.significantHashes.includes(hash)) return this.#defaultId
        return hash.substring(1)
    }

    get significantSections() { 
        return Array.from(document.querySelectorAll(this.#selector))
    }

    get significantHashes() { 
        return this.significantSections.map(section => `#${section.getAttribute('id') || section.getAttribute("data-proxy")}`)
    }

    static async delayedAction (delay: number, func: CallableFunction = () => {}){
        return new Promise((yep) => setTimeout(() => yep(func()), delay))
    }

    static showLoader(){
        headerMainFooter.forEach(Router.hideElement)
        if(loaderSection instanceof Element) Router.showElement(loaderSection)
    }
    
    static hideLoader(){
        if(loaderSection instanceof Element) Router.hideElement(loaderSection)
        headerMainFooter.forEach(Router.showElement)
    }

    static hideElement(element: Element){
        element.classList.add('d-none')
    }

    static showElement(element: Element){
        element.classList.remove('d-none')
    }
}
