import {
    BeamOsError,
    BeamOsObjectType,
    ErrorType,
    Restraint,
    Result,
} from "./EditorApiAlpha";

export class BeamOsErrorFactory {
    static None(): BeamOsError {
        return new BeamOsError({
            code: "",
            description: "",
            type: ErrorType._0,
            numericType: 0,
        });
    }
}

export class ResultFactory {
    static Success(): Result {
        return new Result({
            isError: false,
            error: BeamOsErrorFactory.None(),
        });
    }

    static Failure(error: BeamOsError): Result {
        return new Result({
            isError: true,
            error: error,
        });
    }
}

export class RestraintContractUtils {
    static GetRestraintType(restraint: Restraint): RestraintType {
        if (
            !restraint.canTranslateAlongX &&
            !restraint.canTranslateAlongY &&
            !restraint.canTranslateAlongZ &&
            restraint.canRotateAboutX &&
            restraint.canRotateAboutY &&
            restraint.canRotateAboutZ
        ) {
            return RestraintType.Pinned;
        } else if (
            !restraint.canTranslateAlongX &&
            !restraint.canTranslateAlongY &&
            !restraint.canTranslateAlongZ &&
            !restraint.canRotateAboutX &&
            !restraint.canRotateAboutY &&
            !restraint.canRotateAboutZ
        ) {
            return RestraintType.Fixed;
        } else {
            return RestraintType.Other;
        }
    }
}

export enum RestraintType {
    Undefined = 0,
    Pinned = 1,
    Fixed = 2,
    Other = 3,
}

export const BeamOsObjectTypes = {
    Undefined: BeamOsObjectType._0,
    Model: BeamOsObjectType._1,
    Node: BeamOsObjectType._2,
    Element1d: BeamOsObjectType._3,
    Material: BeamOsObjectType._4,
    SectionProfile: BeamOsObjectType._5,
    PointLoad: BeamOsObjectType._6,
    MomentLoad: BeamOsObjectType._7,
    DistributedLoad: BeamOsObjectType._8,
    DistributedMomentLoad: BeamOsObjectType._9,
    LoadCase: BeamOsObjectType._10,
    LoadCombination: BeamOsObjectType._11,
    ModelProposal: BeamOsObjectType._12,
    NodeProposal: BeamOsObjectType._13,
    Element1dProposal: BeamOsObjectType._14,
    MaterialProposal: BeamOsObjectType._15,
    SectionProfileProposal: BeamOsObjectType._16,
    Other: BeamOsObjectType._1000,
};

export function objectTypeToString(beamOsObjectType: BeamOsObjectType): string {
    switch (beamOsObjectType) {
        case BeamOsObjectType._0:
            return "Undefined";
        case BeamOsObjectType._1:
            return "Model";
        case BeamOsObjectType._2:
            return "Node";
        case BeamOsObjectType._3:
            return "Element1d";
        case BeamOsObjectType._4:
            return "Material";
        case BeamOsObjectType._5:
            return "SectionProfile";
        case BeamOsObjectType._6:
            return "PointLoad";
        case BeamOsObjectType._7:
            return "MomentLoad";
        case BeamOsObjectType._8:
            return "DistributedLoad";

        case BeamOsObjectType._9:
            return "DistributedMomentLoad";
        case BeamOsObjectType._10:
            return "LoadCase";
        case BeamOsObjectType._11:
            return "LoadCombination";
        case BeamOsObjectType._12:
            return "ModelProposal";
        case BeamOsObjectType._13:
            return "NodeProposal";
        case BeamOsObjectType._14:
            return "Element1dProposal";
        case BeamOsObjectType._15:
            return "MaterialProposal";
        case BeamOsObjectType._16:
            return "SectionProfileProposal";
        case BeamOsObjectType._1000:
            return "Other";
        default:
            throw new Error(`Unknown BeamOsObjectType: ${beamOsObjectType}`);
    }
}
