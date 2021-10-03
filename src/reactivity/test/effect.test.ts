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
    it("should return when call effect",()=>{
        let foo=0;
        const rFn=effect(()=>{
            foo++;
            return 'foo'
        })
        expect(foo).toBe(1);
        const rData = rFn();
        expect(rData).toBe('foo');
    })
    it("scheduler",()=>{
        let dependedFoo;
        let run;
        let scheduler=jest.fn(()=>{
            run=runner;
        })
        const raw = reactive({foo:10});
        const runner = effect(()=>dependedFoo=raw.foo+2,{scheduler});
        expect(scheduler).not.toHaveBeenCalled();
        expect(dependedFoo).toBe(12);
        raw.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        expect(run).toBe(runner);
        expect(dependedFoo).toBe(12);
        run();
        expect(dependedFoo).toBe(13);
    })
})