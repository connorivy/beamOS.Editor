//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v14.0.7.0 (NJsonSchema v11.0.0.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

export interface IEditorEventsApi {

    /**
     * @return OK
     */
    handleNodeMovedEvent(body: NodeMovedEvent): Promise<void>;
}

export class EditorEventsApi implements IEditorEventsApi {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) {
        this.http = http ? http : window as any;
        this.baseUrl = baseUrl ?? "";
    }

    /**
     * @return OK
     */
    handleNodeMovedEvent(body: NodeMovedEvent): Promise<void> {
        let url_ = this.baseUrl + "/EditorEventsApi/HandleNodeMovedEvent";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processHandleNodeMovedEvent(_response);
        });
    }

    protected processHandleNodeMovedEvent(response: Response): Promise<void> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<void>(null as any);
    }
}

export class EditorLocation implements IEditorLocation {
    xCoordinate!: number;
    yCoordinate!: number;
    zCoordinate!: number;

    constructor(data?: IEditorLocation) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.xCoordinate = _data["xCoordinate"];
            this.yCoordinate = _data["yCoordinate"];
            this.zCoordinate = _data["zCoordinate"];
        }
    }

    static fromJS(data: any): EditorLocation {
        data = typeof data === 'object' ? data : {};
        let result = new EditorLocation();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["xCoordinate"] = this.xCoordinate;
        data["yCoordinate"] = this.yCoordinate;
        data["zCoordinate"] = this.zCoordinate;
        return data;
    }
}

export interface IEditorLocation {
    xCoordinate: number;
    yCoordinate: number;
    zCoordinate: number;
}

export class NodeMovedEvent implements INodeMovedEvent {
    nodeId!: string;
    previousLocation!: EditorLocation;
    newLocation!: EditorLocation;

    constructor(data?: INodeMovedEvent) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.previousLocation = new EditorLocation();
            this.newLocation = new EditorLocation();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.nodeId = _data["nodeId"];
            this.previousLocation = _data["previousLocation"] ? EditorLocation.fromJS(_data["previousLocation"]) : new EditorLocation();
            this.newLocation = _data["newLocation"] ? EditorLocation.fromJS(_data["newLocation"]) : new EditorLocation();
        }
    }

    static fromJS(data: any): NodeMovedEvent {
        data = typeof data === 'object' ? data : {};
        let result = new NodeMovedEvent();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["nodeId"] = this.nodeId;
        data["previousLocation"] = this.previousLocation ? this.previousLocation.toJSON() : <any>undefined;
        data["newLocation"] = this.newLocation ? this.newLocation.toJSON() : <any>undefined;
        return data;
    }
}

export interface INodeMovedEvent {
    nodeId: string;
    previousLocation: EditorLocation;
    newLocation: EditorLocation;
}

export class ApiException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new ApiException(message, status, response, headers, null);
}