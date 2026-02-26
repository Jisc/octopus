import fs from "fs/promises";

type TopConcept = {
    uri: string;
    topConceptOf: string;
    label: string;
    hasChildren: boolean;
};

type NarrowConcept = {
    uri: string;
    prefLabel: string;
};

type DataEntry = {
    label: string;
    children: DataEntry[];
};

const base = "https://thesauri.cessda.eu";
const vocid = "elsst-6";
const dataTree: DataEntry[] = [];

async function getTopConcepts(): Promise<TopConcept[]> {
    const url = new URL(`/rest/v1/${vocid}/topConcepts`, base);
    url.searchParams.append("lang", "en");

    const res = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!res.ok) {
        throw new Error(`Failed to fetch first level topics: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as { topconcepts: TopConcept[] };

    return data.topconcepts;
}

async function getNarowerTopics(uri: string): Promise<NarrowConcept[]> {
    const url = new URL(`/rest/v1/${vocid}/narrower`, base);
    url.searchParams.append("uri", uri);
    url.searchParams.append("lang", "en");

    const res = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!res.ok) {
        throw new Error(`Failed to fetch sub topics: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as { narrower: NarrowConcept[] };

    return data.narrower;
}

async function populateChildren(entry: DataEntry, uri: string): Promise<void> {
    const narrowerTopics = await getNarowerTopics(uri);

    console.log(`Populating ${entry.label}, found ${narrowerTopics.length} children`);

    for (const narrowerTopic of narrowerTopics) {
        const childEntry: DataEntry = { label: narrowerTopic.prefLabel, children: [] };
        entry.children.push(childEntry);
        await populateChildren(childEntry, narrowerTopic.uri);
    }

    // artificial delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function generateDataTree(): Promise<DataEntry[]> {
    const topConcepts = await getTopConcepts();

    for (const topConcept of topConcepts) {
        const dataEntry: DataEntry = { label: topConcept.label, children: [] };

        await populateChildren(dataEntry, topConcept.uri);

        dataTree.push(dataEntry);
    }

    return dataTree;

}

async function getDataTree(): Promise<DataEntry[]> {
    try {
        const data = JSON.parse(await fs.readFile("FULL_DATA.json", "utf-8")) as DataEntry[];

        return data;
    } catch {
        const data = await generateDataTree();
        await fs.writeFile("dataTree.json", JSON.stringify(data, null, 2));

        return data;
    }
}

function generateMapCSV(dataTree: DataEntry[]): string {
    const csv: string[] = [];

    for (const entry of dataTree) {
        const lowerLevels: string[] = [];

        const collectLowerLevels = (e: DataEntry): void => {
            for (const child of e.children) {
                lowerLevels.push(child.label);
                collectLowerLevels(child);
            }
        };

        collectLowerLevels(entry);

        csv.push(`"${entry.label}","${lowerLevels.join(" | ")}"\n`);
    }

    csv.sort();

    csv.unshift("TOP LEVEL TOPIC,LOWER LEVELS TOPICS\n");

    return csv.join("");
}

function generateFlatCSV(dataTree: DataEntry[]): string {
    const csv: string[] = [];

    function processEntry(entry: DataEntry, ancestors: string[]): void {
        const row = [...ancestors.map(a => `"${a}"`), `"${entry.label}"`].join(",");
        csv.push(row + "\n");

        for (const child of entry.children) {
            processEntry(child, [...ancestors, entry.label]);
        }
    }

    for (const entry of dataTree) {
        processEntry(entry, []);
    }

    csv.sort();

    return csv.join("");
}

function generateMapJSON(dataTree: DataEntry[]): Record<string, string> {
    const map: Record<string, string> = {};

    function processEntry(entry: DataEntry, topLevel: string): void {
        for (const child of entry.children) {
            map[child.label] = topLevel;
            processEntry(child, topLevel);
        }
    }

    for (const entry of dataTree) {
        processEntry(entry, entry.label);
    }

    return map;
}

async function main(): Promise<void> {
    const dataTree = await getDataTree();

    await fs.writeFile("EXP_LOWER_TOP.json", JSON.stringify(generateMapJSON(dataTree), null, 2));
    await fs.writeFile("EXP_TOP_LOWER.csv", generateMapCSV(dataTree));
    await fs.writeFile("EXP_HIERARCHY.csv", generateFlatCSV(dataTree));
}

void main();