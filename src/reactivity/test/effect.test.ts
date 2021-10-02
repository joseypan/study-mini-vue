import {reactive} from '../reactive';
import {effect} from '../effect';
describe('effect',()=>{
    it('using-effect',()=>{
        const raw = reactive({foo:1});
        let dependedFoo;
        effect(()=>{dependedFoo=raw.foo+1});
        //初始化
        expect(dependedFoo).toBe(2);
        raw.foo++;
        expect(dependedFoo).toBe(3);
    })
})