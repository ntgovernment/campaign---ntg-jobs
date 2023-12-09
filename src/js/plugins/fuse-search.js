"use strict";

class NTGJobSearch {
    constructor() {
        const api = ""

        //Setup vacancy search form
        const vacancySearchForm = document.getElementById("vacancySearchForm");
        this.searchResultsWrapper = document.getElementById("searchResults");
        
        this._fetchNTGJobs().then((data) => {
            this._setupFuseSearch(data);

            vacancySearchForm && vacancySearchForm.addEventListener("submit", this._onFormSubmitCb.bind(this));
            
            //Check the url params and display the results based on the initial parameters provided
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            const searchFormData = new FormData();

            for (const key of urlParams.keys()) {
                const paramsArray = urlParams.get(key).split(',');
                
                paramsArray.forEach((param) => {
                    searchFormData.append(key, param)
                })
            }

            this._populateFieldsPerSearchParam(searchFormData);
            //Search and filter
            const searchResults = this._search(this._buildSearchQuery(searchFormData));

            const filteredResults = this._filterSearchResults(searchResults, searchFormData);
            
            this._showResults(filteredResults);

        })
    }

    _populateFieldsPerSearchParam(formData) {
        const searchTerm = formData.get("keyword"),
        agency = formData.getAll("agency[]"),
        location = formData.getAll("location[]"),
        vacancyType = formData.getAll("vacancy[]"),
        category = formData.getAll("jobCategory[]"),
        renumerationFrom = formData.get("renumerationFrom"),
        renumerationTo = formData.get("renumerationTo"),
        salaryFrom = formData.get("salaryFrom"),
        salaryTo = formData.get("salaryTo"),
        listedTime = formData.get("listedTime");


        if(!this._isEmptyOrNull(searchTerm)) {
            document.getElementById("keyword").value = searchTerm
        }

        if(!this._isEmptyOrNull(agency)) {
            agency.forEach((agency) => {
                $('#agency')[0].sumo.selectItem(agency);
            })
        }

        if(!this._isEmptyOrNull(location)) {
            location.forEach((location) => {
                $('#location')[0].sumo.selectItem(location);
            })
        }

        if(!this._isEmptyOrNull(vacancyType)) {
            vacancyType.forEach((vacancyType) => {
                $('#vacancy')[0].sumo.selectItem(vacancyType);
            })
        }

        if(!this._isEmptyOrNull(category)) {
            category.forEach((category) => {
                $('#jobCategory')[0].sumo.selectItem(category);
            })
        }

        if(!this._isEmptyOrNull(renumerationFrom)) {
            $('#renumerationFrom')[0].sumo.selectItem(renumerationFrom);
        }

        if(!this._isEmptyOrNull(renumerationTo)) {
            $('#renumerationTo')[0].sumo.selectItem(renumerationTo);
        }

        if(!this._isEmptyOrNull(salaryFrom)) {
            $('#salaryFrom')[0].sumo.selectItem(salaryFrom);
        }

        if(!this._isEmptyOrNull(salaryTo)) {
            $('#salaryTo')[0].sumo.selectItem(salaryTo);
        }

        if(!this._isEmptyOrNull(listedTime)) {
            $('#listedTime')[0].sumo.selectItem(listedTime);
        }
    }

    _onFormSubmitCb(e) {
        if(this.searchResultsWrapper) {
            e && e.preventDefault();
        }

        const formData = new FormData(e.target);

        //Change the url when the form is submitted
        var url = new URL(window.location.href);
        var params = new URLSearchParams("");

        for (const key of formData.keys()) {
            params.set(key, formData.getAll(key).join(','));
        }

        url.search = params.toString();

        history.pushState({}, "", url);

        //Search and filter
        const searchResults = this._search(this._buildSearchQuery(formData));

        const filteredResults = this._filterSearchResults(searchResults, formData);

        this._showResults(filteredResults);
    }

    _showResults(results) {
        if(results.length <= 0) {
            this.searchResultsWrapper.innerText = "No results found"; 
            return false;
        }

        const wrapper = document.createElement("div");
        wrapper.classList.add("search-results-wrapper");

        wrapper.innerHTML = `<div class="accordion small" id="jobsearchAccordion"></div><div id="pagination"></div> `;

        //Create the content body
        const accordion = wrapper.querySelector(".accordion");
        results.forEach((result) => {
            const { rtfId, jobTitle, positionNumber, agency, section, locationList, vacancyType, primaryObjective, specialInstructions, attachmentsList, vacancyDesignationList, url, formattedClosingDate} = result;

            let accordionItem = document.createElement("div");
            accordionItem.classList.add("accordion-item");

            let dataTemplate = `<div class="accordion-header py-2" id="heading-${rtfId}">
                <a href="#" class="accordion-button collapsed" role="button" data-bs-toggle="collapse" data-bs-target="#collapse-${rtfId}" aria-expanded="false">
                    <div class="d-flex justify-content-between align-items-start w-100 pe-3">
                        <div class="job-title">${jobTitle}</div>
                        <div class="closing-date">${formattedClosingDate}</div>
                    </div>    
                
                    <div class="vacancy-type">
                        ${vacancyType}
                    </div>
                    
                    <div class="salaryRange">
                        ${this._getSalaryDetails(vacancyDesignationList) ? this._getSalaryDetails(vacancyDesignationList).salaryText : ''}
                    </div>
                </a>
                

            </div>
            <div id="collapse-${rtfId}" class="accordion-collapse multi-collapse accordion-item-content collapse" data-bs-parent="#jobsearchAccordion">
                <div class="accordion-body"></div>
            </div>`;

            accordionItem.insertAdjacentHTML("afterbegin", dataTemplate);

            const accordionBody = accordionItem.querySelector(".accordion-body");

            positionNumber && accordionBody.appendChild(this._createDescriptionRow("Vacancy Number", positionNumber));
            agency && accordionBody.appendChild(this._createDescriptionRow("Agency", agency));
            section && accordionBody.appendChild(this._createDescriptionRow("Work unit", section));
            vacancyType && accordionBody.appendChild(this._createDescriptionRow("Vacancy Type", vacancyType));
            primaryObjective && accordionBody.appendChild(this._createDescriptionRow("Primary Objectives", primaryObjective));
            specialInstructions && accordionBody.appendChild(this._createDescriptionRow("Special Instructions", specialInstructions));

            locationList.length > 0 && accordionBody.appendChild(this._createDescriptionRow("Locations", locationList, "location"));
            attachmentsList.length > 0 && accordionBody.appendChild(this._createDescriptionRow("Attachments", attachmentsList, "attachments"));

            accordionBody.insertAdjacentHTML("beforeend", `<a href="${url}" class="mt-2 btn btn-olive-green py-1" title="${url}">Apply now<i class="ms-3 far fa-external-link ms-05" aria-hidden="true"></i></a>`)
            accordion.appendChild(accordionItem);
        });

        this.searchResultsWrapper.innerHTML = "";
        this.searchResultsWrapper.appendChild(wrapper);

        //Add Pagination
        const noOfItemsPerPage = 10;
        $("#searchResults .accordion-item").slice(10).hide(); 

        $('#pagination').pagination({ 
            items: results.length,   
            itemsOnPage: noOfItemsPerPage,  
            onPageClick: function (noofele) { 
                $(".ntg-jobs-subsite")[0].scrollIntoView({block: "start"});

                $("#searchResults .accordion-item").hide() 
                    .slice(noOfItemsPerPage * (noofele-1), 
                    noOfItemsPerPage + noOfItemsPerPage * (noofele - 1)).show(); 
            } 
        }); 
        
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

        if(this._isEmptyOrNull(renumerationFrom) || this._isEmptyOrNull(renumerationTo) || this._isEmptyOrNull(salaryFrom) || this._isEmptyOrNull(salaryTo) || this._isEmptyOrNull(listedTime)) {
            return searchResults;
        }

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
        vacancyType = formData.getAll("vacancy[]"),
        category = formData.getAll("jobCategory[]");

        if(this._isEmptyOrNull(searchTerm) && this._isEmptyOrNull(agency) && this._isEmptyOrNull(location) && this._isEmptyOrNull(vacancyType) && this._isEmptyOrNull(category) ) {
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

        if(!this._isEmptyOrNull(category)) {
            searchQuery["$and"].push({ "employmentCategoryList.employmentCategoryCodeDesc": this._wrapInQuotesAndJoin(category) });
        }

        return searchQuery;
    }

    /**
     * 
     * @param {string} title | This will be used as the title for the row
     * @param {string | []} description | Can be string or array. If an array, it would not work unless specialDesc is defined
     * @param {String} specialDesc | location and attachments specialDesc available, will generate the descriptions based on those
     * @returns 
     */
    _createDescriptionRow(title, description, specialDesc) {
        let row = document.createElement("div");
        row.classList.add("row","mb-2");

        row.innerHTML = `<div class="col-sm-3 col-md-3">
            <strong class="title">${title}</strong>
        </div>`;

        if (Array.isArray(description) && specialDesc == "location") {
            row.insertAdjacentHTML("beforeend", `<div class="col-sm-9 col-md-9 description">
            ${description.map((element) => element.locationCodeDesc).join(', ')}
        </div>`);
        } else if (Array.isArray(description) && specialDesc == "attachments") {
            row.insertAdjacentHTML("beforeend", `<div class="col-sm-9 col-md-9 description">
                    <table class="table w-auto table-attachments" summary="Job attachment">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th style="whitespace:nowrap">File Extension</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody> 

                    </tbody>
                </table>
            </div>`);

            const attachmentTableBody = row.querySelector(".table-attachments tbody");

            description.forEach((attachment) => {
                const tableRow = `<tr>
                <td>${attachment.fileName && attachment.fileName.split("-")[0]}</td>
                <td>${attachment.fileExtension}</td>
                <td><a href="${attachment.fileURL}" class="text-nowrap" target="_blank" rel="noopener" title="Opens in a new window">Download<i class="fas fa-arrow-to-bottom ms-1"></i></a></td>
            </tr>`;

                attachmentTableBody.insertAdjacentHTML("beforeend", tableRow);
            });

        } else if (!Array.isArray(description)) {
            row.insertAdjacentHTML("beforeend", `<div class="col-sm-9 col-md-9 description">
            ${description}
        </div>`);
        }

        return row;
    }

    /**
     * 
     * @param {Array} vacancyDesignationList | Array of vacancy designation list
     * @returns 
     */
    _getSalaryDetails(vacancyDesignationList) {
        if(vacancyDesignationList.length <= 0) {
            return false;
        }

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
            threshold: 0.3,
            useExtendedSearch: true,
            ignoreLocation: true,
            keys: [
                "primaryObjective", 
                "positionNumber",
                "jobTitle",
                "agency",
                "locationList.locationCodeDesc",
                "employmentCategoryList.employmentCategoryCodeDesc",
                "vacancyType"
            ]
        };
        
        this.fuse = new Fuse(data, fuseOptions);
    }

    async _fetchNTGJobs() {
        let url;

        if(window.location.host == "nt-dev.nt.gov.au") {
            console.log("NT Dev server")
            url = "https://nt-dev.nt.gov.au/ntgjobs/jobs.json"
        } else {
            url = "./jobs.json";
        }

        try {
            const response = await fetch(url, {
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

const search = (typeof Fuse != "undefined") && new NTGJobSearch();