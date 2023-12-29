//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v14.0.0.0 (NJsonSchema v11.0.0.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

export interface IEditorApiAlpha {

    /**
     * @return Success
     */
    createNode(nodeResponse: NodeResponse): Promise<string>;

    /**
     * @return Success
     */
    createElement1d(element1DResponse: Element1DResponse): Promise<string>;
}

export class EditorApiAlpha implements IEditorApiAlpha {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) {
        this.http = http ? http : window as any;
        this.baseUrl = baseUrl ?? "";
    }

    /**
     * @return Success
     */
    createNode(nodeResponse: NodeResponse): Promise<string> {
        let url_ = this.baseUrl + "/api/nodes";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(nodeResponse);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processCreateNode(_response);
        });
    }

    protected processCreateNode(response: Response): Promise<string> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = resultData200 !== undefined ? resultData200 : <any>null;
    
            return result200;
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            return throwException("Unauthorized", status, _responseText, _headers);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<string>(null as any);
    }

    /**
     * @return Success
     */
    createElement1d(element1DResponse: Element1DResponse): Promise<string> {
        let url_ = this.baseUrl + "/api/element1ds";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(element1DResponse);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processCreateElement1d(_response);
        });
    }

    protected processCreateElement1d(response: Response): Promise<string> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = resultData200 !== undefined ? resultData200 : <any>null;
    
            return result200;
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            return throwException("Unauthorized", status, _responseText, _headers);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<string>(null as any);
    }
}

export class NodeResponse implements INodeResponse {
    id!: string;
    modelId!: string;
    locationPoint!: PointResponse;
    restraint!: RestraintResponse;

    constructor(data?: INodeResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.locationPoint = new PointResponse();
            this.restraint = new RestraintResponse();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.modelId = _data["modelId"];
            this.locationPoint = _data["locationPoint"] ? PointResponse.fromJS(_data["locationPoint"]) : new PointResponse();
            this.restraint = _data["restraint"] ? RestraintResponse.fromJS(_data["restraint"]) : new RestraintResponse();
        }
    }

    static fromJS(data: any): NodeResponse {
        data = typeof data === 'object' ? data : {};
        let result = new NodeResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["modelId"] = this.modelId;
        data["locationPoint"] = this.locationPoint ? this.locationPoint.toJSON() : <any>undefined;
        data["restraint"] = this.restraint ? this.restraint.toJSON() : <any>undefined;
        return data;
    }
}

export interface INodeResponse {
    id: string;
    modelId: string;
    locationPoint: PointResponse;
    restraint: RestraintResponse;
}

export class PointResponse implements IPointResponse {
    xCoordinate!: UnitValueDTO;
    yCoordinate!: UnitValueDTO;
    zCoordinate!: UnitValueDTO;

    constructor(data?: IPointResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.xCoordinate = new UnitValueDTO();
            this.yCoordinate = new UnitValueDTO();
            this.zCoordinate = new UnitValueDTO();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.xCoordinate = _data["xCoordinate"] ? UnitValueDTO.fromJS(_data["xCoordinate"]) : new UnitValueDTO();
            this.yCoordinate = _data["yCoordinate"] ? UnitValueDTO.fromJS(_data["yCoordinate"]) : new UnitValueDTO();
            this.zCoordinate = _data["zCoordinate"] ? UnitValueDTO.fromJS(_data["zCoordinate"]) : new UnitValueDTO();
        }
    }

    static fromJS(data: any): PointResponse {
        data = typeof data === 'object' ? data : {};
        let result = new PointResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["xCoordinate"] = this.xCoordinate ? this.xCoordinate.toJSON() : <any>undefined;
        data["yCoordinate"] = this.yCoordinate ? this.yCoordinate.toJSON() : <any>undefined;
        data["zCoordinate"] = this.zCoordinate ? this.zCoordinate.toJSON() : <any>undefined;
        return data;
    }
}

export interface IPointResponse {
    xCoordinate: UnitValueDTO;
    yCoordinate: UnitValueDTO;
    zCoordinate: UnitValueDTO;
}

export class UnitValueDTO implements IUnitValueDTO {
    value!: number;
    unit!: string;

    constructor(data?: IUnitValueDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.value = _data["value"];
            this.unit = _data["unit"];
        }
    }

    static fromJS(data: any): UnitValueDTO {
        data = typeof data === 'object' ? data : {};
        let result = new UnitValueDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["value"] = this.value;
        data["unit"] = this.unit;
        return data;
    }
}

export interface IUnitValueDTO {
    value: number;
    unit: string;
}

export class RestraintResponse implements IRestraintResponse {
    canTranslateAlongX!: boolean;
    canTranslateAlongY!: boolean;
    canTranslateAlongZ!: boolean;
    canRotateAboutX!: boolean;
    canRotateAboutY!: boolean;
    canRotateAboutZ!: boolean;

    constructor(data?: IRestraintResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.canTranslateAlongX = _data["canTranslateAlongX"];
            this.canTranslateAlongY = _data["canTranslateAlongY"];
            this.canTranslateAlongZ = _data["canTranslateAlongZ"];
            this.canRotateAboutX = _data["canRotateAboutX"];
            this.canRotateAboutY = _data["canRotateAboutY"];
            this.canRotateAboutZ = _data["canRotateAboutZ"];
        }
    }

    static fromJS(data: any): RestraintResponse {
        data = typeof data === 'object' ? data : {};
        let result = new RestraintResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["canTranslateAlongX"] = this.canTranslateAlongX;
        data["canTranslateAlongY"] = this.canTranslateAlongY;
        data["canTranslateAlongZ"] = this.canTranslateAlongZ;
        data["canRotateAboutX"] = this.canRotateAboutX;
        data["canRotateAboutY"] = this.canRotateAboutY;
        data["canRotateAboutZ"] = this.canRotateAboutZ;
        return data;
    }
}

export interface IRestraintResponse {
    canTranslateAlongX: boolean;
    canTranslateAlongY: boolean;
    canTranslateAlongZ: boolean;
    canRotateAboutX: boolean;
    canRotateAboutY: boolean;
    canRotateAboutZ: boolean;
}

export class Element1DResponse implements IElement1DResponse {
    id!: string;
    modelId!: string;
    startNodeId!: string;
    endNodeId!: string;
    materialId!: string;
    sectionProfileId!: string;
    sectionProfileRotation!: UnitValueDTO;

    constructor(data?: IElement1DResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.sectionProfileRotation = new UnitValueDTO();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.modelId = _data["modelId"];
            this.startNodeId = _data["startNodeId"];
            this.endNodeId = _data["endNodeId"];
            this.materialId = _data["materialId"];
            this.sectionProfileId = _data["sectionProfileId"];
            this.sectionProfileRotation = _data["sectionProfileRotation"] ? UnitValueDTO.fromJS(_data["sectionProfileRotation"]) : new UnitValueDTO();
        }
    }

    static fromJS(data: any): Element1DResponse {
        data = typeof data === 'object' ? data : {};
        let result = new Element1DResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["modelId"] = this.modelId;
        data["startNodeId"] = this.startNodeId;
        data["endNodeId"] = this.endNodeId;
        data["materialId"] = this.materialId;
        data["sectionProfileId"] = this.sectionProfileId;
        data["sectionProfileRotation"] = this.sectionProfileRotation ? this.sectionProfileRotation.toJSON() : <any>undefined;
        return data;
    }
}

export interface IElement1DResponse {
    id: string;
    modelId: string;
    startNodeId: string;
    endNodeId: string;
    materialId: string;
    sectionProfileId: string;
    sectionProfileRotation: UnitValueDTO;
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