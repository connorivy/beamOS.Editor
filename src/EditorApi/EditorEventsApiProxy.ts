import { IEditorEventsApi } from "./EditorEventsApi";

export const IEditorEventsApiFactory = (dotnetRef: IEditorEventsApi) =>
    new Proxy(dotnetRef, {
        get(dotnetReference, prop: string, _) {
            const invokeMethodName = "invokeMethodAsync";
            let invokeFunc = (<any>dotnetReference)[invokeMethodName];
            if (invokeFunc instanceof Function) {
                return function (...args: any[]) {
                    return invokeFunc.apply(dotnetReference, [
                        GetCsMethodName(prop),
                        ...args,
                    ]);
                };
            }
            // let realFunc = (<any>dotnetReference).invokeMethodAsync;
            // let funcName = GetCsMethodName(prop);

            // if (realFunc[funcName] instanceof Function) {
            //     return function (...args: any[]) {
            //         return realFunc[funcName].apply(realFunc, args);
            //     };
            // }
        },
    });

function GetCsMethodName(tsName: string) {
    return tsName.charAt(0).toUpperCase() + tsName.slice(1) + "Async";
}
