import { BeamOsError, ErrorType, Restraint, Result } from "./EditorApiAlpha";

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
