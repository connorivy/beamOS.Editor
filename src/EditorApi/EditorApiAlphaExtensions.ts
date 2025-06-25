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
    InternalNode: BeamOsObjectType._3,
    Element1d: BeamOsObjectType._4,
    Material: BeamOsObjectType._5,
    SectionProfile: BeamOsObjectType._6,
    SectionProfileFromLibrary: BeamOsObjectType._7,
    PointLoad: BeamOsObjectType._50,
    MomentLoad: BeamOsObjectType._51,
    DistributedLoad: BeamOsObjectType._52,
    DistributedMomentLoad: BeamOsObjectType._53,
    LoadCase: BeamOsObjectType._70,
    LoadCombination: BeamOsObjectType._71,
    ModelProposal: BeamOsObjectType._100,
    NodeProposal: BeamOsObjectType._101,
    InternalNodeProposal: BeamOsObjectType._102,
    Element1dProposal: BeamOsObjectType._103,
    MaterialProposal: BeamOsObjectType._104,
    SectionProfileProposal: BeamOsObjectType._105,
    Other: BeamOsObjectType._255,
};

export function objectTypeToString(beamOsObjectType: BeamOsObjectType): string {
    switch (beamOsObjectType) {
        case BeamOsObjectTypes.Undefined:
            return "Undefined";
        case BeamOsObjectTypes.Model:
            return "Model";
        case BeamOsObjectTypes.Node:
            return "Node";
        case BeamOsObjectTypes.InternalNode:
            return "InternalNode";
        case BeamOsObjectTypes.Element1d:
            return "Element1d";
        case BeamOsObjectTypes.Material:
            return "Material";
        case BeamOsObjectTypes.SectionProfile:
            return "SectionProfile";
        case BeamOsObjectTypes.SectionProfileFromLibrary:
            return "SectionProfileFromLibrary";
        case BeamOsObjectTypes.PointLoad:
            return "PointLoad";
        case BeamOsObjectTypes.MomentLoad:
            return "MomentLoad";
        case BeamOsObjectTypes.DistributedLoad:
            return "DistributedLoad";

        case BeamOsObjectTypes.DistributedMomentLoad:
            return "DistributedMomentLoad";
        case BeamOsObjectTypes.LoadCase:
            return "LoadCase";
        case BeamOsObjectTypes.LoadCombination:
            return "LoadCombination";
        case BeamOsObjectTypes.ModelProposal:
            return "ModelProposal";
        case BeamOsObjectTypes.NodeProposal:
            return "NodeProposal";
        case BeamOsObjectTypes.InternalNodeProposal:
            return "InternalNodeProposal";
        case BeamOsObjectTypes.Element1dProposal:
            return "Element1dProposal";
        case BeamOsObjectTypes.MaterialProposal:
            return "MaterialProposal";
        case BeamOsObjectTypes.SectionProfileProposal:
            return "SectionProfileProposal";
        case BeamOsObjectTypes.Other:
            return "Other";
        default:
            throw new Error(`Unknown BeamOsObjectType: ${beamOsObjectType}`);
    }
}
