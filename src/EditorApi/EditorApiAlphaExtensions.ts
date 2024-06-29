import { BeamOsError, Result } from "./EditorApiAlpha";

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
