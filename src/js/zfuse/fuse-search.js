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
            this._setupFuseSearch(data);

            vacancySearchForm && vacancySearchForm.addEventListener("submit", this._onFormSubmitCb.bind(this));
        })
    }


    _onFormSubmitCb(e) {
        e && e.preventDefault();

        const formData = new FormData(e.target);

        const searchResults = this._search(this._buildSearchQuery(formData));

        const filteredResults = this._filterSearchResults(searchResults, formData);


        console.log(filteredResults);
    }

    _search(searchQuery) {
        let results;
        
        if(searchQuery != "") {
            const searchResults = this.fuse.search(searchQuery);

            results = searchResults.map(result => result.item);

            return results;
        } else { //Return all results if the search query is empty
            results = this.fuse._docs;
        }

        return results;
    }
    
    _filterSearchResults(searchResults, formData) {
        const renumerationFrom = formData.get("renumerationFrom"),
        renumerationTo = formData.get("renumerationTo"),
        salaryFrom = formData.get("salaryFrom"),
        salaryTo = formData.get("salaryTo"),
        listedTime = formData.get("listedTime"),
        filteredResults = [];

        searchResults.forEach(element => {
            const dateListed = element.dateAdded;
            const salaryDetails = this._getSalaryDetails(element.vacancyDesignationList);
            const currentDate = new Date();
            let dateFilterCheck;

            if(dateListed && listedTime) {
                const listedDate = new Date(dateListed);

                const timeDifference = currentDate - listedDate;

                switch (listedTime) {
                    case "anytime":
                        dateFilterCheck = true;
                        break;
                    case "today":
                        dateFilterCheck = timeDifference < 24 * 60 * 60 * 1000;
                        break;
                    case "3":
                        dateFilterCheck = timeDifference < 3 * 24 * 60 * 60 * 1000;
                        break;
                    case "7":
                        dateFilterCheck = timeDifference < 7 * 24 * 60 * 60 * 1000;
                        break;
                    case "14":
                        dateFilterCheck = timeDifference < 14 * 24 * 60 * 60 * 1000;
                        break;
                    case "30":
                        dateFilterCheck = timeDifference < 30 * 24 * 60 * 60 * 1000;
                        break;
                    default:
                        dateFilterCheck = true;
                }
            }

            if(salaryDetails) {
                const minsalaryCheck = salaryDetails.minSalary >= salaryFrom;
                const maxSalaryCheck = salaryTo === "max" ? salaryDetails.maxSalary >= 0 : salaryDetails.maxSalary <= salaryTo; //Show all the jobs if the salaryTo is max
                const minRenumerationCheck = salaryDetails.minRenumeration >= renumerationFrom
                const maxRenumerationCheck = renumerationTo === "max" ? salaryDetails.maxRenumeration >= 0 : salaryDetails.maxRenumeration <= renumerationTo; //Show all the jobs if the renumerationTo is max

                if(minsalaryCheck && maxSalaryCheck && minRenumerationCheck && maxRenumerationCheck && dateFilterCheck) {
                    filteredResults.push(element);
                }
            } else {
                //If no salary details, the positions are voluntary, include them in the results as well
                dateFilterCheck && filteredResults.push(element);
            }      

        });

        return filteredResults;
    }
    
    _buildSearchQuery(formData) {
        const searchTerm = formData.get("keyword"),
        agency = formData.getAll("agency[]"),
        location = formData.getAll("location[]"),
        vacancyType = formData.getAll("vacancy[]");

        if(this._isEmptyOrNull(searchTerm) && this._isEmptyOrNull(agency) && this._isEmptyOrNull(location) && this._isEmptyOrNull(vacancyType) ) {
            return "";
        }

        let searchQuery = {
            "$and": []
        };

        if(!this._isEmptyOrNull(searchTerm)) {
            searchQuery["$and"].push({
                $or: [
                    { "primaryObjective": formData.get("keyword") },
                    { "positionNumber": formData.get("keyword") },
                    { "jobTitle": formData.get("keyword") }
                ]
            });
        }

        if(!this._isEmptyOrNull(agency)) {
            searchQuery["$and"].push({ "agency": this._wrapInQuotesAndJoin(agency) });
        }

        if(!this._isEmptyOrNull(location)) {
            searchQuery["$and"].push({ "locationList.locationCodeDesc": this._wrapInQuotesAndJoin(location) });
        }

        if(!this._isEmptyOrNull(vacancyType)) {
            searchQuery["$and"].push({ "vacancyType": this._wrapInQuotesAndJoin(vacancyType) });
        }

        return searchQuery;
    }

    /**
     * 
     * @param {Array} vacancyDesignationList | Array of vacancy designation list
     * @returns 
     */
    _getSalaryDetails(vacancyDesignationList) {
        let minimumSalary = 0;
        let maximumSalary = 0;

        let minSalaryDesignation,
            maxSalaryDesignation;
        
        if (vacancyDesignationList.length > 0) {
            vacancyDesignationList.forEach((vacancyDesignation) => {

                if (vacancyDesignation.salaryMin < minimumSalary || minimumSalary == 0) {
                    minSalaryDesignation = vacancyDesignation;
                    minimumSalary = vacancyDesignation.salaryMin;
                }

                if (vacancyDesignation.salaryMax > maximumSalary || maximumSalary == 0) {
                    maxSalaryDesignation = vacancyDesignation;
                    maximumSalary = vacancyDesignation.salaryMax;
                }
            })

            let salaryText;

            if (minSalaryDesignation == maxSalaryDesignation) {
                salaryText = `${minSalaryDesignation.advertisedCode} - Remuneration Package ${minSalaryDesignation.packageRange} (including salary ${minSalaryDesignation.salaryRange})`;
            } else {
                salaryText = `${minSalaryDesignation.advertisedCode} - Remuneration Package ${minSalaryDesignation.packageRange} (including salary ${minSalaryDesignation.salaryRange}) To ${maxSalaryDesignation.advertisedCode} - Remuneration Package ${maxSalaryDesignation.packageRange} (including salary ${maxSalaryDesignation.salaryRange})`;
            }

            return {
                "salaryText": salaryText,
                "minSalary": minimumSalary,
                "maxSalary": maximumSalary,
                "minRenumeration": minSalaryDesignation.packageMin,
                "maxRenumeration": maxSalaryDesignation.packageMax
            };

        }
        
    }
  

    _setupFuseSearch(data) {
        const fuseOptions = {
            // isCaseSensitive: false,
            includeScore: false,
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
                "jobTitle",
                {
                    "name": "agency",
                    "weight": 2
                },
                "locationList.locationCodeDesc",
                {
                    "name": "vacancyType",
                    "weight": 2,
                },
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

    //Helper function to wrap array items into double quotes and join the array with |
    _wrapInQuotesAndJoin(array) {
        const arrayInQuotes = array.map(arrayItem => `"${arrayItem}"`);

        return `'` + arrayInQuotes.join("|'");
    }

    // Helper function to check if empty, null, undefined or an empty array
    _isEmptyOrNull(str) {
        return str === null || str === undefined || (!Array.isArray(str) && str.trim()) === '' || (Array.isArray(str) && str.length < 1);
    }

    //Helper function to clean object inside array
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
}

const search = new NTGJobSearch();