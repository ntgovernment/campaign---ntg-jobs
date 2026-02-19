"use strict";

class NTGJobSearch {
    constructor(synonymDict) {
        const api = "";
        this.synonyms = synonymDict;
        
        this.allLocations = ["Darwin", "Palmerston", "Alice Springs", "Katherine", "Tennant Creek", "Nhulunbuy"];

        //Setup vacancy search form
        const vacancySearchForm = document.getElementById("vacancySearchForm");
        this.searchResultsWrapper = document.getElementById("searchResults");
        this.searchContainer = ".search_container";
        this.searchSort = ".searchResults__sort";
        this.searchResultsNumber = ".searchResults__total-results";
        this.currentSearchResults;

        if(!this.searchResultsWrapper) {
            return false;
        }
        
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

            this.currentSearchResults = Array.from(filteredResults);
            this._showResults(filteredResults);

            document.querySelector(this.searchSort).addEventListener("change", this._onSortSelectChangeCb.bind(this));
        }, (error) => {
            console.log("Error fetching the data. Please try again later.");
        })
    }

    _getSectionsByAgency(data) {
        const agencySections = {};

        data.forEach(item => {
            const { agency, section } = item;
            if (!agencySections[agency]) {
                agencySections[agency] = [];
            }
            if (!agencySections[agency].includes(section)) {
                agencySections[agency].push(section);
            }
        });

        return agencySections;
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

    _onSortSelectChangeCb(e) {
        this._showResults(Array.from(this.currentSearchResults), e);
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
        this.currentSearchResults = Array.from(filteredResults);
        this._showResults(filteredResults, e);
    }
    
    /**
     * 
     * @param {Array} results | Array of Jobs results
     * @returns {Array} | Array of sorted job results based on the value of the sort select
     */
    _sortResults(results) {
        const sortSelectValue = $(this.searchSort)[0].value;

        switch(sortSelectValue) {
            case "closing_soon":
                //Helper function to split date
                /**
                 * 
                 * @param {String} dateString | Date in DD/MM/YYYY format
                 * @returns {String} | Date in YYYY-MM-DD Format
                 */
                function checkAndConvertDateFormat(dateString) {
                    const futureDate = "3070-01-01";

                    if(dateString) {
                        let dateParts = dateString.split('/');

                        if(dateParts.length == 3) {
                            let day = dateParts[0];
                            let month = dateParts[1];
                            let year = dateParts[2]; 
        
                            return `${year}-${month}-${day}`;
                        } else {
                            return futureDate;
                        }
                    } else {
                        return futureDate;
                    }
                }

                results.sort((a,b) => {
                    const aClosingDate = new Date(checkAndConvertDateFormat(a.closingDate));
                    const bClosingDate = new Date(checkAndConvertDateFormat(b.closingDate));

                    return aClosingDate - bClosingDate;
                });
                break;
            case "most_recent":
                results.sort((a,b) => {
                    const aAddedDate = new Date(a.dateAdded);
                    const bAddedDate = new Date(b.dateAdded);

                    return bAddedDate - aAddedDate;
                });
                break;
            case "renumeration_asc": 
                results.sort((a, b) => {
                    const aSalaryDetails = this._getSalaryDetails(a.vacancyDesignationList);
                    const bSalaryDetails = this._getSalaryDetails(b.vacancyDesignationList);
                    const aMinRenumeration = aSalaryDetails ? aSalaryDetails.minRenumeration : Infinity;
                    const bMinRenumeration = bSalaryDetails ? bSalaryDetails.minRenumeration : Infinity;

                    return aMinRenumeration - bMinRenumeration;
                });
                break;
            case "renumeration_dsc":
                results.sort((a, b) => {
                    const aSalaryDetails = this._getSalaryDetails(a.vacancyDesignationList);
                    const bSalaryDetails = this._getSalaryDetails(b.vacancyDesignationList);
                    const aMaxRenumeration = aSalaryDetails ? aSalaryDetails.maxRenumeration : -Infinity;
                    const bMaxRenumeration = bSalaryDetails ? bSalaryDetails.maxRenumeration : -Infinity;

                    return bMaxRenumeration - aMaxRenumeration;
                });
                break;
            case "vacancy_type":
                results.sort((a, b) => {
                    const aVacationType = a.vacancyType;
                    const bVacationType = b.vacancyType;

                    if(aVacationType < bVacationType) {
                        return 1;
                    }

                    if(aVacationType > bVacationType) {
                        return -1;
                    }

                    return 0;
                });
                break;
            default:
        }
        
        return results;
    }

    _showResults(results, e) {
        results = this._sortResults(results);

        //Start the seach spinner and hide the search container until results are loaded
        $("#searchSpinner").removeClass("d-none");
        $(this.searchContainer).addClass("d-none");

        //Only scroll if showresults is coming from event like formsubmit, etc.
        if(e) {
            $(".ntg-jobs-subsite")[0].scrollIntoView({block: "start", behaviour: "smooth"});
        }

        if(results.length <= 0) {
            this.searchResultsWrapper.innerHTML = "<p class='small'>There are no jobs for the search. Try searching something else or try again later</p>"; 
            
            $(this.searchResultsNumber).html(`${results.length} results`);

            //Hide the search spinner and show the search container class
            $(this.searchContainer).removeClass("d-none");
            $("#searchSpinner").addClass("d-none");

            return false;
        }

        $(this.searchResultsNumber).html(`${results.length} results`);

        const wrapper = document.createElement("div");
        wrapper.classList.add("search-results-wrapper");

        wrapper.innerHTML = `<div class="accordion small" id="jobsearchAccordion"></div><div id="pagination"></div> `;

        //Create the content body
        const accordion = wrapper.querySelector(".accordion");
        results.forEach((result) => {
            const { rtfId, jobTitle, positionNumber, agency, section, locationList, vacancyType, primaryObjective, specialInstructions, attachmentsList, vacancyDesignationList, url, formattedClosingDate} = result;

            let accordionItem = document.createElement("div");
            accordionItem.classList.add("accordion-item");

            const salaryDetails = this._getSalaryDetails(vacancyDesignationList);
            const salaryRangeHtml = salaryDetails && salaryDetails.salaryText 
                ? `<div class="salaryRange">${salaryDetails.salaryText}</div>` 
                : '';

            let dataTemplate = `<div class="accordion-header" id="heading-${rtfId}">
                <a href="#" class="accordion-button collapsed" role="button" data-bs-toggle="collapse" data-bs-target="#collapse-${rtfId}" aria-expanded="false">
                    <div class="d-flex justify-content-between align-items-start w-100 pe-3">
                        <div class="job-title">${jobTitle}</div>
                        <div class="closing-date">${formattedClosingDate}</div>
                    </div>    
                
                    <div class="vacancy-type">
                        ${vacancyType}
                    </div>
                    
                    ${salaryRangeHtml}
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
            attachmentsList.length > 0 && accordionBody.appendChild(this._createDescriptionRow("Attachments", attachmentsList, "attachments", positionNumber));

            const jobUrl = `https://jointheterritory.nt.gov.au/vacancy?id=${positionNumber}&banner=1322978`;
            const jobUrlLinkedin = `https://jointheterritory.nt.gov.au/vacancy?id%3D${positionNumber}&banner%3D1322978`;

            const lastAccordionRow = `<div class="d-flex align-items-center">
                    <a id="${rtfId}" href="${url}" data-agency="${agency}" data-work-unit="${section}" class="me-2 btn btn-territory-forest py-1" title="${url} "data-redirect-popup="true" data-redirect-description="To NT Government job application portal. You will need to login or register to apply.">Apply now<i class="ms-3 far fa-external-link ms-05" aria-hidden="true"></i></a>
                    <button class="btn btn-outline-territory-forest py-1 me-2" data-url="${jobUrl}">Copy link<i class="ms-3 far fa-copy ms-05" aria-hidden="true"></i></button>
                    <div class="social-share">
                        <a class="social-share__link facebook" href="https://www.facebook.com/sharer.php?u=${jobUrl}" target="_blank" title="Share on Facebook"><i class="fa-brands fa-square-facebook"></i></a>
                        <a class="social-share__link linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${jobUrlLinkedin}" target="_blank" title="Share on linkedin"><i class="fa-brands fa-linkedin"></i></a>
                        <a class="social-share__link x" href="https://x.com/intent/tweet?url=${jobUrl}&text=${jobTitle}" target="_blank" title="Share on X"><i class="fa-brands fa-square-x-twitter"></i></a>
                    </div>
                </div>`;

            accordionBody.insertAdjacentHTML("beforeend", lastAccordionRow);

            accordion.appendChild(accordionItem);

            var share = accordionItem.querySelector('button');
            share.addEventListener('click', function () {
                var url = share.getAttribute('data-url');
                navigator.clipboard.writeText(url);
                share.innerHTML = 'Copied!<i class="ms-3 far fa-copy ms-05" aria-hidden="true"></i>';
                setTimeout(() => {
                    share.innerHTML = 'Copy link<i class="ms-3 far fa-copy ms-05" aria-hidden="true"></i>'
                }, '1000');
            });
        });

        this.searchResultsWrapper.innerHTML = "";
        this.searchResultsWrapper.appendChild(wrapper);

        this.searchResultsWrapper.querySelectorAll('a[data-redirect-popup="true"]').forEach(function (link) {
            var href = link.getAttribute('href');
            var desc = link.getAttribute('data-redirect-description');
            var parent = link.parentElement;
            var text = link.innerText;
            var textIDFormat = 'link-' + link.id.toLowerCase().replace(/\s/g, '-');
            var textARIAFormat = textIDFormat;
    
            link.setAttribute('data-bs-toggle', 'modal');
            link.setAttribute('data-bs-target', '#' + textIDFormat);
    
            var modal = document.createElement('div');
            modal.classList.add('modal', 'fade');
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('id', textIDFormat);
            modal.setAttribute('aria-labelledby', textARIAFormat);
            modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Redirecting...</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${desc}</p>
                    </div>
                    <div class="modal-footer">
                        <a href="${href}" class="btn btn-sm btn-secondary btn-external">Ok</a>
                    </div>
                </div>
            </div>
            `;
            parent.insertAdjacentElement('afterend', modal);
        });

        //Add Pagination
        const noOfItemsPerPage = 10;
        $("#searchResults .accordion-item").slice(10).hide(); 

        $('#pagination').pagination({ 
            items: results.length,   
            itemsOnPage: noOfItemsPerPage,  
            displayedPages: 3,
            edges: 1,
            onPageClick: function (noofele) { 
                $(".ntg-jobs-subsite")[0].scrollIntoView({block: "start"});

                $("#searchResults .accordion-item").hide() 
                    .slice(noOfItemsPerPage * (noofele-1), 
                    noOfItemsPerPage + noOfItemsPerPage * (noofele - 1)).show(); 
            } 
        }); 
        
        //Hide the search spinner and show the search container class
        $(this.searchContainer).removeClass("d-none");
        $("#searchSpinner").addClass("d-none");
    }

    _customScoringMatches(result, searchTerm) {                
        const cloResult = { ...result };
        const { item, matches } = cloResult;
        
        // Clone the item to avoid modifying the original
        const highlightedItem = cloResult.item;

        let score = cloResult.score;
        let maxMatchLength = 0;

        matches.forEach(match => {
            const { key, indices } = match;
            let text = item[key];

            if(match.key == "primaryObjective" && match.key == "jobTitle") {
                // Process indices in reverse order to avoid shifting
                const highlightedText = [...indices]
                .reverse() // Reverse to handle from the end in case we need to mark the items
                .reduce((acc, [start, end]) => {
                    const before = acc.slice(0, start);
                    const match = acc.slice(start, end + 1);
                    const after = acc.slice(end + 1);

                    //Result gets an extra point if there is white space before
                    const isWhitespaceBefore = (start > 0 && acc[start - 1] === ' ') ? 1 : 0;
                    //Result gets an extra point if there is white space after
                    const isWhitespaceAfter = (end < acc.length && acc[end + 1] === ' ') ? 1 : 0;
                    //Result get half a point if it is in the start of the sentence
                    const isStartZero = start == 0 ? 0.5 : 0;
                    //Result get half a point if it is in the end of the sentence
                    const isEnd = (end == acc.length) ? 0.5 : 0;
                    //Result get 1 point if it is uppercase
                    const isUppercase = (match === match.toUpperCase()) ? 1 : 0;
                    
                    if(match.length > maxMatchLength) {
                        maxMatchLength = match.length;
                    }

                    score = score + isWhitespaceBefore + isWhitespaceAfter + isStartZero + isEnd + isUppercase;

                    return before + match + after;
                }, text);

                highlightedItem[key] = highlightedText;
            }
            
        });

        //Add the maximum number of matched characters to the score to show the longest matching result first
        score = score + (maxMatchLength * 2);
        cloResult.score = score;

        //Normalize the score between 0 and 1, assuming that the maximum value can be 1000                        
        function normalizeScale(num, min, max) {
            return (num - min) / (max - min);
        }

        score = normalizeScale(score, 0, 1000);
        
        return cloResult;
    }

    _search(searchQuery) {
        let results;
        
        if(searchQuery != "") {
            const searchResults = this.fuse.search(searchQuery);

            const scoreResults = searchResults.map(result => this._customScoringMatches(result, searchQuery));

            const finalResults = scoreResults.sort((a, b) => {
                return b.score - a.score;
            })
            .map(result => result.item);

            return finalResults;
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
                //Convert Microsoft date format to JS Date
                const timestamp = parseInt(dateListed.match(/\d+/)[0], 10);
                const listedDate = new Date(timestamp);

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

    _expandQuery(query) {
        const words = [query.toLowerCase()];

        let expandedWords = words.flatMap(word => {
            let expWords = [word];

            this.synonyms.forEach((synonym) => {
                if(synonym.includes(word)) {
                    expWords.push(...synonym);
                }                
            })

            return expWords;
        });


        //Keep only unique values
        expandedWords = [...new Set(expandedWords)];
        
        let expandedExactMatch = expandedWords.map(item => `'"${item}"`);

        return expandedExactMatch.join("|");
    }
    
    _buildSearchQuery(formData) {
        let searchTerm = formData.get("keyword"),
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
            searchTerm = this._expandQuery(searchTerm);

            searchQuery["$and"].push({
                $or: [
                    { "primaryObjective": searchTerm },
                    { "positionNumber": searchTerm },
                    { "jobTitle": searchTerm }
                ]
            });
        }

        if(!this._isEmptyOrNull(agency)) {
            searchQuery["$and"].push({ "agency": this._wrapInQuotesAndJoin(agency) });
        }

        if(!this._isEmptyOrNull(location)) {
            if(location.includes("Remote")) {
                let excludeLocationArray = this.allLocations.map(loc => {
                    return `!"${loc}"`
                });

                const finalExcludeArray = excludeLocationArray.filter(eloc => {
                    const filteredEloc = eloc.replace(/!/g, '').replace(/"/g, '');

                    return !location.includes(filteredEloc)
                })

                const searchString = finalExcludeArray.join(" ");

                searchQuery["$and"].push({ "locationList.locationCodeDesc": searchString});
            } else {
                searchQuery["$and"].push({ "locationList.locationCodeDesc": this._wrapInQuotesAndJoin(location) });
            }
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
    _createDescriptionRow(title, description, specialDesc, vacancyNo) {
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
                let template = `<tr>
                    <td>${attachment.fileName && attachment.fileName.split("-")[0]}</td>
                    <td>${attachment.fileExtension}</td>
                    <td><a href="${attachment.fileURL}" class="text-nowrap" target="_blank" rel="noopener" title="Opens in a new window">Download<i class="fas fa-arrow-to-bottom ms-1"></i></a></td>
                </tr>`;

                let attachmentId;

                if(attachment.fileExtension == "docx") {
                    const urlObj = new URL(attachment.fileURL);
                    attachmentId = urlObj.searchParams.get("id");

                    template = `<tr>
                        <td>${attachment.fileName && attachment.fileName.split("-")[0]}</td>
                        <td>HTML</td>
                        <td>${attachment.fileExtension == "docx" ? `<a href="${this.searchResultsWrapper.getAttribute("data-url-dochtml")}?attachmentId=${attachmentId}&id=${vacancyNo}" class="d-block text-nowrap view-online" target="_blank" rel="noopener" title="Opens in a new window">View Online<i class="fas fa-eye ms-1"></i></a></td>` : "</td>"}
                    </tr>` + template;
                }


                attachmentTableBody.insertAdjacentHTML("beforeend", template);
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

            // Check if we have at least a designation
            if (!minSalaryDesignation) {
                return false;
            }

            let salaryText;

            // Helper function to build salary text for a designation
            const buildDesignationText = (designation) => {
                let text = designation.advertisedCode || '';
                
                if (designation.packageRange) {
                    text += ` - Remuneration Package ${designation.packageRange}`;
                    
                    if (designation.salaryRange) {
                        text += ` (including salary ${designation.salaryRange})`;
                    }
                }
                
                return text;
            };

            if (minSalaryDesignation == maxSalaryDesignation) {
                salaryText = buildDesignationText(minSalaryDesignation);
            } else {
                const minText = buildDesignationText(minSalaryDesignation);
                const maxText = buildDesignationText(maxSalaryDesignation);
                salaryText = `${minText} To ${maxText}`;
            }
            
            // Don't return result if there's no text at all
            if (!salaryText || !salaryText.trim()) {
                return false;
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
            isCaseSensitive: false,
            useExtendedSearch: true,
            includeMatches: true,
            includeScore: true,
            threshold: 0,
            ignoreFieldNorm: true,
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
        let url = this.searchResultsWrapper.getAttribute("data-search-json");

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
            const alertTemplate = `<div class="alert alert-danger" role="alert">
                        <h3 class="mb-1 fs-4">Error</h3>
                       <p>There was an error fetching the latest vacancies. Please try again later.</p> 
            </div>`;

            this.searchResultsWrapper.insertAdjacentHTML("afterend", alertTemplate);

            document.querySelector(this.searchSort).parentElement.classList.add("d-none");

            console.error(`Error fetching Data: ${error}`);

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

const search = (typeof Fuse != "undefined") && new NTGJobSearch(synonymDict);