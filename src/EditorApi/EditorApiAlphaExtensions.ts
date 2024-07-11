import { BeamOsError, RestraintResponse, Result } from "./EditorApiAlpha";

export class BeamOsErrorFactory {
    static None(): BeamOsError {
        return new BeamOsError({
            code: "",
            description: "",
        });
    }
}

export class ResultFactory {
    static Success(): Result {
        return new Result({
            isSuccess: true,
            error: BeamOsErrorFactory.None(),
        });
    }

    static Failure(error: BeamOsError): Result {
        return new Result({
            isSuccess: false,
            error: error,
        });
    }
}

export class RestraintResponseUtils {
    static GetRestraintType(restraint: RestraintResponse): RestraintType {
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
