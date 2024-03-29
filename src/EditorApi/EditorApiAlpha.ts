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
    createModelHydrated(
        modelResponseHydrated: ModelResponseHydrated,
    ): Promise<string>;

    /**
     * @return Success
     */
    createElement1d(element1DResponse: Element1DResponse): Promise<string>;
}

export class EditorApiAlpha implements IEditorApiAlpha {
    private http: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined =
        undefined;

    constructor(
        baseUrl?: string,
        http?: {
            fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
        },
    ) {
        this.http = http ? http : (window as any);
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
                Accept: "application/json",
            },
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processCreateNode(_response);
        });
    }

    protected processCreateNode(response: Response): Promise<string> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && response.headers.forEach) {
            response.headers.forEach((v: any, k: any) => (_headers[k] = v));
        }
        if (status === 200) {
            return response.text().then((_responseText) => {
                let result200: any = null;
                let resultData200 =
                    _responseText === ""
                        ? null
                        : JSON.parse(_responseText, this.jsonParseReviver);
                result200 =
                    resultData200 !== undefined ? resultData200 : <any>null;

                return result200;
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
                return throwException(
                    "Unauthorized",
                    status,
                    _responseText,
                    _headers,
                );
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException(
                    "An unexpected server error occurred.",
                    status,
                    _responseText,
                    _headers,
                );
            });
        }
        return Promise.resolve<string>(null as any);
    }

    /**
     * @return Success
     */
    createModelHydrated(
        modelResponseHydrated: ModelResponseHydrated,
    ): Promise<string> {
        let url_ = this.baseUrl + "/api/models";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(modelResponseHydrated);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processCreateModelHydrated(_response);
        });
    }

    protected processCreateModelHydrated(response: Response): Promise<string> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && response.headers.forEach) {
            response.headers.forEach((v: any, k: any) => (_headers[k] = v));
        }
        if (status === 200) {
            return response.text().then((_responseText) => {
                let result200: any = null;
                let resultData200 =
                    _responseText === ""
                        ? null
                        : JSON.parse(_responseText, this.jsonParseReviver);
                result200 =
                    resultData200 !== undefined ? resultData200 : <any>null;

                return result200;
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
                return throwException(
                    "Unauthorized",
                    status,
                    _responseText,
                    _headers,
                );
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException(
                    "An unexpected server error occurred.",
                    status,
                    _responseText,
                    _headers,
                );
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
                Accept: "application/json",
            },
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processCreateElement1d(_response);
        });
    }

    protected processCreateElement1d(response: Response): Promise<string> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && response.headers.forEach) {
            response.headers.forEach((v: any, k: any) => (_headers[k] = v));
        }
        if (status === 200) {
            return response.text().then((_responseText) => {
                let result200: any = null;
                let resultData200 =
                    _responseText === ""
                        ? null
                        : JSON.parse(_responseText, this.jsonParseReviver);
                result200 =
                    resultData200 !== undefined ? resultData200 : <any>null;

                return result200;
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
                return throwException(
                    "Unauthorized",
                    status,
                    _responseText,
                    _headers,
                );
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException(
                    "An unexpected server error occurred.",
                    status,
                    _responseText,
                    _headers,
                );
            });
        }
        return Promise.resolve<string>(null as any);
    }
}

export abstract class BeamOsContractBase implements IBeamOsContractBase {
    constructor(data?: IBeamOsContractBase) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {}

    static fromJS(data: any): BeamOsContractBase {
        data = typeof data === "object" ? data : {};
        throw new Error(
            "The abstract class 'BeamOsContractBase' cannot be instantiated.",
        );
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        return data;
    }
}

export interface IBeamOsContractBase {}

export class NodeResponse extends BeamOsContractBase implements INodeResponse {
    id!: string;
    modelId!: string;
    locationPoint!: PointResponse;
    restraint!: RestraintResponse;

    constructor(data?: INodeResponse) {
        super(data);
        if (!data) {
            this.locationPoint = new PointResponse();
            this.restraint = new RestraintResponse();
        }
    }

    init(_data?: any) {
        super.init(_data);
        if (_data) {
            this.id = _data["id"];
            this.modelId = _data["modelId"];
            this.locationPoint = _data["locationPoint"]
                ? PointResponse.fromJS(_data["locationPoint"])
                : new PointResponse();
            this.restraint = _data["restraint"]
                ? RestraintResponse.fromJS(_data["restraint"])
                : new RestraintResponse();
        }
    }

    static fromJS(data: any): NodeResponse {
        data = typeof data === "object" ? data : {};
        let result = new NodeResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["modelId"] = this.modelId;
        data["locationPoint"] = this.locationPoint
            ? this.locationPoint.toJSON()
            : <any>undefined;
        data["restraint"] = this.restraint
            ? this.restraint.toJSON()
            : <any>undefined;
        super.toJSON(data);
        return data;
    }
}

export interface INodeResponse extends IBeamOsContractBase {
    id: string;
    modelId: string;
    locationPoint: PointResponse;
    restraint: RestraintResponse;
}

export class PointResponse
    extends BeamOsContractBase
    implements IPointResponse
{
    xCoordinate!: UnitValueDTO;
    yCoordinate!: UnitValueDTO;
    zCoordinate!: UnitValueDTO;

    constructor(data?: IPointResponse) {
        super(data);
        if (!data) {
            this.xCoordinate = new UnitValueDTO();
            this.yCoordinate = new UnitValueDTO();
            this.zCoordinate = new UnitValueDTO();
        }
    }

    init(_data?: any) {
        super.init(_data);
        if (_data) {
            this.xCoordinate = _data["xCoordinate"]
                ? UnitValueDTO.fromJS(_data["xCoordinate"])
                : new UnitValueDTO();
            this.yCoordinate = _data["yCoordinate"]
                ? UnitValueDTO.fromJS(_data["yCoordinate"])
                : new UnitValueDTO();
            this.zCoordinate = _data["zCoordinate"]
                ? UnitValueDTO.fromJS(_data["zCoordinate"])
                : new UnitValueDTO();
        }
    }

    static fromJS(data: any): PointResponse {
        data = typeof data === "object" ? data : {};
        let result = new PointResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["xCoordinate"] = this.xCoordinate
            ? this.xCoordinate.toJSON()
            : <any>undefined;
        data["yCoordinate"] = this.yCoordinate
            ? this.yCoordinate.toJSON()
            : <any>undefined;
        data["zCoordinate"] = this.zCoordinate
            ? this.zCoordinate.toJSON()
            : <any>undefined;
        super.toJSON(data);
        return data;
    }
}

export interface IPointResponse extends IBeamOsContractBase {
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
        data = typeof data === "object" ? data : {};
        let result = new UnitValueDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["value"] = this.value;
        data["unit"] = this.unit;
        return data;
    }
}

export interface IUnitValueDTO {
    value: number;
    unit: string;
}

export class RestraintResponse
    extends BeamOsContractBase
    implements IRestraintResponse
{
    canTranslateAlongX!: boolean;
    canTranslateAlongY!: boolean;
    canTranslateAlongZ!: boolean;
    canRotateAboutX!: boolean;
    canRotateAboutY!: boolean;
    canRotateAboutZ!: boolean;

    constructor(data?: IRestraintResponse) {
        super(data);
    }

    init(_data?: any) {
        super.init(_data);
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
        data = typeof data === "object" ? data : {};
        let result = new RestraintResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["canTranslateAlongX"] = this.canTranslateAlongX;
        data["canTranslateAlongY"] = this.canTranslateAlongY;
        data["canTranslateAlongZ"] = this.canTranslateAlongZ;
        data["canRotateAboutX"] = this.canRotateAboutX;
        data["canRotateAboutY"] = this.canRotateAboutY;
        data["canRotateAboutZ"] = this.canRotateAboutZ;
        super.toJSON(data);
        return data;
    }
}

export interface IRestraintResponse extends IBeamOsContractBase {
    canTranslateAlongX: boolean;
    canTranslateAlongY: boolean;
    canTranslateAlongZ: boolean;
    canRotateAboutX: boolean;
    canRotateAboutY: boolean;
    canRotateAboutZ: boolean;
}

export class ModelResponseHydrated
    extends BeamOsContractBase
    implements IModelResponseHydrated
{
    id!: string;
    name!: string;
    description!: string;
    settings!: ModelSettingsResponse;
    nodes!: NodeResponse[];
    element1Ds!: Element1DResponse[];
    materials!: MaterialResponse[];
    sectionProfiles!: SectionProfileResponse[];
    pointLoads!: PointLoadResponse[];
    momentLoads!: MomentLoadResponse[];

    constructor(data?: IModelResponseHydrated) {
        super(data);
        if (!data) {
            this.settings = new ModelSettingsResponse();
            this.nodes = [];
            this.element1Ds = [];
            this.materials = [];
            this.sectionProfiles = [];
            this.pointLoads = [];
            this.momentLoads = [];
        }
    }

    init(_data?: any) {
        super.init(_data);
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.description = _data["description"];
            this.settings = _data["settings"]
                ? ModelSettingsResponse.fromJS(_data["settings"])
                : new ModelSettingsResponse();
            if (Array.isArray(_data["nodes"])) {
                this.nodes = [] as any;
                for (let item of _data["nodes"])
                    this.nodes!.push(NodeResponse.fromJS(item));
            }
            if (Array.isArray(_data["element1Ds"])) {
                this.element1Ds = [] as any;
                for (let item of _data["element1Ds"])
                    this.element1Ds!.push(Element1DResponse.fromJS(item));
            }
            if (Array.isArray(_data["materials"])) {
                this.materials = [] as any;
                for (let item of _data["materials"])
                    this.materials!.push(MaterialResponse.fromJS(item));
            }
            if (Array.isArray(_data["sectionProfiles"])) {
                this.sectionProfiles = [] as any;
                for (let item of _data["sectionProfiles"])
                    this.sectionProfiles!.push(
                        SectionProfileResponse.fromJS(item),
                    );
            }
            if (Array.isArray(_data["pointLoads"])) {
                this.pointLoads = [] as any;
                for (let item of _data["pointLoads"])
                    this.pointLoads!.push(PointLoadResponse.fromJS(item));
            }
            if (Array.isArray(_data["momentLoads"])) {
                this.momentLoads = [] as any;
                for (let item of _data["momentLoads"])
                    this.momentLoads!.push(MomentLoadResponse.fromJS(item));
            }
        }
    }

    static fromJS(data: any): ModelResponseHydrated {
        data = typeof data === "object" ? data : {};
        let result = new ModelResponseHydrated();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["description"] = this.description;
        data["settings"] = this.settings
            ? this.settings.toJSON()
            : <any>undefined;
        if (Array.isArray(this.nodes)) {
            data["nodes"] = [];
            for (let item of this.nodes) data["nodes"].push(item.toJSON());
        }
        if (Array.isArray(this.element1Ds)) {
            data["element1Ds"] = [];
            for (let item of this.element1Ds)
                data["element1Ds"].push(item.toJSON());
        }
        if (Array.isArray(this.materials)) {
            data["materials"] = [];
            for (let item of this.materials)
                data["materials"].push(item.toJSON());
        }
        if (Array.isArray(this.sectionProfiles)) {
            data["sectionProfiles"] = [];
            for (let item of this.sectionProfiles)
                data["sectionProfiles"].push(item.toJSON());
        }
        if (Array.isArray(this.pointLoads)) {
            data["pointLoads"] = [];
            for (let item of this.pointLoads)
                data["pointLoads"].push(item.toJSON());
        }
        if (Array.isArray(this.momentLoads)) {
            data["momentLoads"] = [];
            for (let item of this.momentLoads)
                data["momentLoads"].push(item.toJSON());
        }
        super.toJSON(data);
        return data;
    }
}

export interface IModelResponseHydrated extends IBeamOsContractBase {
    id: string;
    name: string;
    description: string;
    settings: ModelSettingsResponse;
    nodes: NodeResponse[];
    element1Ds: Element1DResponse[];
    materials: MaterialResponse[];
    sectionProfiles: SectionProfileResponse[];
    pointLoads: PointLoadResponse[];
    momentLoads: MomentLoadResponse[];
}

export class ModelSettingsResponse implements IModelSettingsResponse {
    unitSettings!: UnitSettingsResponse;

    constructor(data?: IModelSettingsResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.unitSettings = new UnitSettingsResponse();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.unitSettings = _data["unitSettings"]
                ? UnitSettingsResponse.fromJS(_data["unitSettings"])
                : new UnitSettingsResponse();
        }
    }

    static fromJS(data: any): ModelSettingsResponse {
        data = typeof data === "object" ? data : {};
        let result = new ModelSettingsResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["unitSettings"] = this.unitSettings
            ? this.unitSettings.toJSON()
            : <any>undefined;
        return data;
    }
}

export interface IModelSettingsResponse {
    unitSettings: UnitSettingsResponse;
}

export class UnitSettingsResponse implements IUnitSettingsResponse {
    lengthUnit!: string;
    areaUnit!: string;
    volumeUnit!: string;
    forceUnit!: string;
    forcePerLengthUnit!: string;
    torqueUnit!: string;

    constructor(data?: IUnitSettingsResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.lengthUnit = _data["lengthUnit"];
            this.areaUnit = _data["areaUnit"];
            this.volumeUnit = _data["volumeUnit"];
            this.forceUnit = _data["forceUnit"];
            this.forcePerLengthUnit = _data["forcePerLengthUnit"];
            this.torqueUnit = _data["torqueUnit"];
        }
    }

    static fromJS(data: any): UnitSettingsResponse {
        data = typeof data === "object" ? data : {};
        let result = new UnitSettingsResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["lengthUnit"] = this.lengthUnit;
        data["areaUnit"] = this.areaUnit;
        data["volumeUnit"] = this.volumeUnit;
        data["forceUnit"] = this.forceUnit;
        data["forcePerLengthUnit"] = this.forcePerLengthUnit;
        data["torqueUnit"] = this.torqueUnit;
        return data;
    }
}

export interface IUnitSettingsResponse {
    lengthUnit: string;
    areaUnit: string;
    volumeUnit: string;
    forceUnit: string;
    forcePerLengthUnit: string;
    torqueUnit: string;
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
            this.sectionProfileRotation = _data["sectionProfileRotation"]
                ? UnitValueDTO.fromJS(_data["sectionProfileRotation"])
                : new UnitValueDTO();
        }
    }

    static fromJS(data: any): Element1DResponse {
        data = typeof data === "object" ? data : {};
        let result = new Element1DResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["modelId"] = this.modelId;
        data["startNodeId"] = this.startNodeId;
        data["endNodeId"] = this.endNodeId;
        data["materialId"] = this.materialId;
        data["sectionProfileId"] = this.sectionProfileId;
        data["sectionProfileRotation"] = this.sectionProfileRotation
            ? this.sectionProfileRotation.toJSON()
            : <any>undefined;
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

export class MaterialResponse implements IMaterialResponse {
    id!: string;
    modulusOfElasticity!: UnitValueDTO;
    modulusOfRigidity!: UnitValueDTO;

    constructor(data?: IMaterialResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.modulusOfElasticity = new UnitValueDTO();
            this.modulusOfRigidity = new UnitValueDTO();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.modulusOfElasticity = _data["modulusOfElasticity"]
                ? UnitValueDTO.fromJS(_data["modulusOfElasticity"])
                : new UnitValueDTO();
            this.modulusOfRigidity = _data["modulusOfRigidity"]
                ? UnitValueDTO.fromJS(_data["modulusOfRigidity"])
                : new UnitValueDTO();
        }
    }

    static fromJS(data: any): MaterialResponse {
        data = typeof data === "object" ? data : {};
        let result = new MaterialResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["modulusOfElasticity"] = this.modulusOfElasticity
            ? this.modulusOfElasticity.toJSON()
            : <any>undefined;
        data["modulusOfRigidity"] = this.modulusOfRigidity
            ? this.modulusOfRigidity.toJSON()
            : <any>undefined;
        return data;
    }
}

export interface IMaterialResponse {
    id: string;
    modulusOfElasticity: UnitValueDTO;
    modulusOfRigidity: UnitValueDTO;
}

export class SectionProfileResponse implements ISectionProfileResponse {
    id!: string;
    area!: UnitValueDTO;
    strongAxisMomentOfInertia!: UnitValueDTO;
    weakAxisMomentOfInertia!: UnitValueDTO;
    polarMomentOfInertia!: UnitValueDTO;

    constructor(data?: ISectionProfileResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.area = new UnitValueDTO();
            this.strongAxisMomentOfInertia = new UnitValueDTO();
            this.weakAxisMomentOfInertia = new UnitValueDTO();
            this.polarMomentOfInertia = new UnitValueDTO();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.area = _data["area"]
                ? UnitValueDTO.fromJS(_data["area"])
                : new UnitValueDTO();
            this.strongAxisMomentOfInertia = _data["strongAxisMomentOfInertia"]
                ? UnitValueDTO.fromJS(_data["strongAxisMomentOfInertia"])
                : new UnitValueDTO();
            this.weakAxisMomentOfInertia = _data["weakAxisMomentOfInertia"]
                ? UnitValueDTO.fromJS(_data["weakAxisMomentOfInertia"])
                : new UnitValueDTO();
            this.polarMomentOfInertia = _data["polarMomentOfInertia"]
                ? UnitValueDTO.fromJS(_data["polarMomentOfInertia"])
                : new UnitValueDTO();
        }
    }

    static fromJS(data: any): SectionProfileResponse {
        data = typeof data === "object" ? data : {};
        let result = new SectionProfileResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["area"] = this.area ? this.area.toJSON() : <any>undefined;
        data["strongAxisMomentOfInertia"] = this.strongAxisMomentOfInertia
            ? this.strongAxisMomentOfInertia.toJSON()
            : <any>undefined;
        data["weakAxisMomentOfInertia"] = this.weakAxisMomentOfInertia
            ? this.weakAxisMomentOfInertia.toJSON()
            : <any>undefined;
        data["polarMomentOfInertia"] = this.polarMomentOfInertia
            ? this.polarMomentOfInertia.toJSON()
            : <any>undefined;
        return data;
    }
}

export interface ISectionProfileResponse {
    id: string;
    area: UnitValueDTO;
    strongAxisMomentOfInertia: UnitValueDTO;
    weakAxisMomentOfInertia: UnitValueDTO;
    polarMomentOfInertia: UnitValueDTO;
}

export class PointLoadResponse implements IPointLoadResponse {
    id!: string;
    nodeId!: string;
    force!: UnitValueDTO;
    normalizedDirection!: Vector3;

    constructor(data?: IPointLoadResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.force = new UnitValueDTO();
            this.normalizedDirection = new Vector3();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.nodeId = _data["nodeId"];
            this.force = _data["force"]
                ? UnitValueDTO.fromJS(_data["force"])
                : new UnitValueDTO();
            this.normalizedDirection = _data["normalizedDirection"]
                ? Vector3.fromJS(_data["normalizedDirection"])
                : new Vector3();
        }
    }

    static fromJS(data: any): PointLoadResponse {
        data = typeof data === "object" ? data : {};
        let result = new PointLoadResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["nodeId"] = this.nodeId;
        data["force"] = this.force ? this.force.toJSON() : <any>undefined;
        data["normalizedDirection"] = this.normalizedDirection
            ? this.normalizedDirection.toJSON()
            : <any>undefined;
        return data;
    }
}

export interface IPointLoadResponse {
    id: string;
    nodeId: string;
    force: UnitValueDTO;
    normalizedDirection: Vector3;
}

export class Vector3 implements IVector3 {
    x!: number;
    y!: number;
    z!: number;

    constructor(data?: IVector3) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.x = _data["x"];
            this.y = _data["y"];
            this.z = _data["z"];
        }
    }

    static fromJS(data: any): Vector3 {
        data = typeof data === "object" ? data : {};
        let result = new Vector3();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["x"] = this.x;
        data["y"] = this.y;
        data["z"] = this.z;
        return data;
    }
}

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}

export class MomentLoadResponse implements IMomentLoadResponse {
    id!: string;
    nodeId!: string;
    torque!: UnitValueDTO;
    normalizedAxisDirection!: Vector3;

    constructor(data?: IMomentLoadResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
        if (!data) {
            this.torque = new UnitValueDTO();
            this.normalizedAxisDirection = new Vector3();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.nodeId = _data["nodeId"];
            this.torque = _data["torque"]
                ? UnitValueDTO.fromJS(_data["torque"])
                : new UnitValueDTO();
            this.normalizedAxisDirection = _data["normalizedAxisDirection"]
                ? Vector3.fromJS(_data["normalizedAxisDirection"])
                : new Vector3();
        }
    }

    static fromJS(data: any): MomentLoadResponse {
        data = typeof data === "object" ? data : {};
        let result = new MomentLoadResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === "object" ? data : {};
        data["id"] = this.id;
        data["nodeId"] = this.nodeId;
        data["torque"] = this.torque ? this.torque.toJSON() : <any>undefined;
        data["normalizedAxisDirection"] = this.normalizedAxisDirection
            ? this.normalizedAxisDirection.toJSON()
            : <any>undefined;
        return data;
    }
}

export interface IMomentLoadResponse {
    id: string;
    nodeId: string;
    torque: UnitValueDTO;
    normalizedAxisDirection: Vector3;
}

export class ApiException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any };
    result: any;

    constructor(
        message: string,
        status: number,
        response: string,
        headers: { [key: string]: any },
        result: any,
    ) {
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

function throwException(
    message: string,
    status: number,
    response: string,
    headers: { [key: string]: any },
    result?: any,
): any {
    if (result !== null && result !== undefined) throw result;
    else throw new ApiException(message, status, response, headers, null);
}
