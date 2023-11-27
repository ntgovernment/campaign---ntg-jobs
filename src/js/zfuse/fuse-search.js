"use strict";

class NTGJobSearch {
    constructor() {
        const api = ""
        const fields = {
            "keywords" : document.getElementById("keywords"),
            "vacancyNumber": document.getElementById("vacancyNumber")
        }

        //Setup vacancy search form
        const vacancySearchForm = document.getElementById("vacancySearchForm");
        
        this._fetchNTGJobs().then((data) => {
            console.log(data);
            this._setupFuseSearch(data);

            vacancySearchForm && vacancySearchForm.addEventListener("submit", this._onFormSubmitCb.bind(this));
        })
    }

    _onFormSubmitCb(e) {
        e && e.preventDefault();

        const formData = new FormData(e.target);

        const searchQuery = [{
                $and: [
                    {
                        $or: [
                            {"primaryObjective": formData.get("keyword")},
                            {"positionNumber": formData.get("keyword")}
                        ]
                    },
                    {"agency": `=${formData.get("department")}`},
                    {"vacancyType": `${formData.get("vacancy")}`}
                ]
            }
        ]

        console.log(this._search(searchQuery))
    }

    _search(searchQuery) {
        const query = this._cleanObjectInsideArray(searchQuery);

        console.log(query);

        const searchPattern = {
            $and : query
        }

        const results = this.fuse.search(searchPattern);

        return results;
    }

    
    _cleanObjectInsideArray(arr) {
        let arr2 = arr.filter((obj) => {
            if((Object.values(obj)[0] === undefined || Object.values(obj)[0] === null || Object.values(obj)[0] === '' || Object.values(obj)[0] === "'")) {
                return false;
            } else {
                return true;
            }
        })
        
        return arr2;
    }
  

    _setupFuseSearch(data) {
        const fuseOptions = {
            // isCaseSensitive: false,
            // includeScore: false,
            // shouldSort: true,
            // includeMatches: false,
            // findAllMatches: false,
            // minMatchCharLength: 1,
            // location: 0,
            threshold: 0.6,
            // distance: 100,
            useExtendedSearch: true,
            ignoreLocation: true,
            // ignoreFieldNorm: false,
            // fieldNormWeight: 1,
            keys: [
                "primaryObjective", 
                "positionNumber",
                "agency",
                "vacancyType"
            ]
        };
        
        this.fuse = new Fuse(data, fuseOptions);
    }

    async _fetchNTGJobs() {
        try {
            const response = await fetch("./jobs.json", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const jobs = await response.json();

            return jobs.vacancySearchResults;
        } catch(error) {
            console.error(`Error fetching Data: ${error}`)
        }
    }
}

const search = new NTGJobSearch();