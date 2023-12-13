export interface NodeResponse {
    id: string,
    modelId: string,
    locationPoint: PointResponse,
    Restraint: RestraintResponse
}

export interface PointResponse{
    xCoordinate: UnitValueDTO,
    yCoordinate: UnitValueDTO,
    zCoordinate: UnitValueDTO
}

export interface UnitValueDTO { 
    value: number,
    unit: string
}

export interface RestraintResponse {
    canTranslateAlongX: boolean,
    canTranslateAlongY: boolean,
    canTranslateAlongZ: boolean,
    canRotateAboutX: boolean,
    canRotateAboutY: boolean,
    canRotateAboutZ: boolean,
}