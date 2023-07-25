import { library, branch } from '$lib/manage-cookies.ts';

let library_;
library.subscribe((value) => {
    library_ = value;
});

let branch_;
branch.subscribe((value) => {
    branch_ = value;
});

export async function getLibraryList(): Promise<Map<string, string>> {
    function parseLibraryList(dom: Document): Map<string, string> {
        const libraries = new Map();
        const libraryList = dom.getElementById("library_select");
        for (const library of libraryList.children) {
            libraries.set(library.getAttribute("value"), library.textContent);
        }
        return libraries;
    }
    const domParser = new DOMParser();
    return parseLibraryList(domParser.parseFromString(await (await fetch("https://developer.bibliocommons.com/info/select_library")).text(), "text/html"));
}

export async function getBranches(): Promise<Map<string, string>> {
    function parseBranches(json: JSON): Map<string, string> {
        const branches = new Map();
        const id = json["library"]["id"];
        const branchesList = json["entities"]["libraries"][String(id)]["branches"];
        for (const branch of branchesList) {
            branches.set(branch["code"], branch["name"]);
        }
        return branches
    }
    return parseBranches(await (await fetch("https://gateway.bibliocommons.com/v2/libraries/"+library_)).json());
}

async function getAvailability(id: string): Promise<Map<string, string>> {
    // branch: status (statusType)
    function parseAvailability(json: JSON): Map<string, string> {
        const availability = new Map();
        const items = json["entities"]["bibItems"];
        for (const [itemId, item] of Object.entries(items)) {
            const libraryCode = item["branch"]["code"];
            if (availability.has(libraryCode)) {
                if (availability.get(libraryCode) == "UNAVAILABLE") {
                    availability.set(libraryCode, item["availability"]["statusType"])
                }
            } else {
                availability.set(libraryCode, item["availability"]["statusType"])
            }
        }
        return availability
    }
    return parseAvailability(await (await fetch("https://gateway.bibliocommons.com/v2/libraries/"+library_+"/bibs/" + id + "/availability")).json());
}

interface Movie {
    title: string;
    subtitle: string;
    id: string;
    groupId: string;
    format: string;
}

async function getMovie(title: string, year: string): Promise<Array<Movie>> {
    function parseMovies(json: JSON): Array<Movie> {
        const movies = new Array();
        if (json["entities"] == null || json["entities"]["bibs"] == null) {
            return null
        }
        const items = json["entities"]["bibs"];
        for (const [itemID, item] of Object.entries(items)) {
            const itemTitle = item["briefInfo"]["title"];
            const itemSubtitle = item["briefInfo"]["subtitle"];
            if (Math.max(similarity(title, itemTitle), similarity(title, itemTitle+": "+itemSubtitle)) >= 0.7) {
                movies.push({
                    title: item["briefInfo"]["title"],
                    subtitle: item["briefInfo"]["subtitle"],
                    id: itemID,
                    groupId: item["briefInfo"]["groupKey"],
                    format: item["briefInfo"]["format"],
                });
            }
        }
        return movies
    }

    const query = "(title:("+title+") AND pubyear:["+year+" TO *] AND formatcode:(BLURAY OR DVD))"
    return parseMovies(await (await fetch("https://gateway.bibliocommons.com/v2/libraries/"+library_+"/bibs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "query": query, 
            "searchType":"bl",
            "custom_edit":"true",
            "suppress": "true",
            "sort": "relevancy"
        })})).json());
}

interface Availability {
    atBranch: boolean;
    branchLink: string;
    inLibrary: boolean;
    libraryLink: string;
}

const defaultAvailability: Availability = {
    atBranch: false,
    branchLink: "",
    inLibrary: false,
    libraryLink: ""
}

interface MovieAvailability {
    title: string;
    year: string;
    BLURAY: Availability;
    DVD: Availability;
}

async function getMovieAvailability(title: string, year: string): Promise<MovieAvailability> {
    function updateAvailability(id: string, availability: Availability, branchToAvailable: Map<string, string>) {
        for (const [branchCode, status] of branchToAvailable.entries()) {
            if (branchCode == branch_) {
                if (availability["atBranch"] != true) {
                    if (status == "AVAILABLE") {
                        availability["atBranch"] = true;
                        availability["branchLink"] = "https://"+library_+".bibliocommons.com/v2/record/"+id;
                    } else if (availability["branchLink"] == "") {
                        availability["branchLink"] = "https://"+library_+".bibliocommons.com/v2/record/"+id;
                    }
                }
            } else if (availability["inLibrary"] != true) {
                if (status == "AVAILABLE") {
                    availability["inLibrary"] = true;
                    availability["libraryLink"] = "https://"+library_+".bibliocommons.com/v2/record/"+id;
                } else if (availability["libraryLink"] == "") {
                    availability["libraryLink"] = "https://"+library_+".bibliocommons.com/v2/record/"+id;
                }
            }
        }
    }

    const movies = await getMovie(title, year);
    if (movies != null && movies.length != 0) {

        const movieAvailability: MovieAvailability = {
            title: title,
            year: year,
            BLURAY: Object.assign({},defaultAvailability),
            DVD: Object.assign({},defaultAvailability),      
        };

        const movieGroupID = movies[0].groupId;
        const movieGroup = new Array();
        for (const movie of movies) {
            if (movie.groupId == movieGroupID) {
                movieGroup.push(movie)
            }
        }
        for (const movie of movieGroup) {
            updateAvailability(movie.id, movieAvailability[movie.format], await getAvailability(movie.id))
        }

        return movieAvailability;
    }

    return null;
}

// getMovieAvailability("Shrek").then(
//     x => console.log(x)
// )
// getMovieAvailability("Mission Impossible").then(
//     x => console.log(x)
// )