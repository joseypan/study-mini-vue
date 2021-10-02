import {reactive} from '../reactive';
describe('reactive',()=>{
    it('using-reactive',()=>{
        const raw = {foo:2};
        const reactiveRaw = reactive(raw);
        expect(reactiveRaw).not.toBe(raw);
        expect(reactiveRaw.foo).toBe(raw.foo);
    })
})