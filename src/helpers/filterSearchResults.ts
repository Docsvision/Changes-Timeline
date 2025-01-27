import { highlightText } from "@/helpers/highlightText";
import { Build } from "@/types/Types";

export function filterSearchResults(builds: Build[], query: string): Build[] {
    return builds
        .map(build => {
            const matchingChanges = build.changes
                .map(change => {
                    const titleHighlighted = highlightText(change.title, query);
                    const descriptionHighlighted = highlightText(change.description, query);
                    const detailedHighlighted = change.detailed ? highlightText(change.detailed, query) : "";
                    return {
                        ...change,
                        title: titleHighlighted,
                        description: descriptionHighlighted,
                        detailed: detailedHighlighted,
                    };
                })
                .filter(change =>
                    change.title.includes("<mark>") ||
                    change.description.includes("<mark>") ||
                    (change.detailed && change.detailed.includes("<mark>"))
                );

            return matchingChanges.length ? { ...build, changes: matchingChanges } : null;
        })
        .filter(Boolean) as Build[];
};