import { ColorFilterBuilder } from "./ColorFilterer";


export class FilterStack {
    private filters: ColorFilterBuilder[] = [];

    public push(filter: ColorFilterBuilder) {
        this.filters.push(filter);
    }

    public pop() {
        if (this.filters.length === 0) {
            throw new Error("No filters to pop");
        }
        const filter = this.filters.pop();
        filter?.clear();
    }

    public apply() {
        for (const filter of this.filters) {
            filter.apply();
        }
    }

    public clear() {
        for (const filter of this.filters) {
            filter.clear();
        }
        this.filters = [];
    }
}
