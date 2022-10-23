import setup from './lib/router'
import HelloWorld from './lib/HelloWorld.svelte'

const {hash, props} = setup()
const gameSection = document.querySelector('#game')

props.subscribe(args => {
    const {target, props} = args
    if(target.id !== 'game') return
    gameSection.innerHTML = ''
    Reflect.construct(HelloWorld, [{target, props}])
})

export default null
