$(document).ready(function(e){
    let colorTagMap = new Map();

    colorTagMap.set("food", "violet");
    colorTagMap.set("art", "red");
    colorTagMap.set("entertainment", "blue");
    colorTagMap.set("local-news", "indigo");
    colorTagMap.set("local-events", "green");
    colorTagMap.set("resource-listing", "coral");
    colorTagMap.set("crisis-support", "amber");
    colorTagMap.set("support-groups", "pink");
    colorTagMap.set("third-space", "lime");

    let iconMap = new Map();

    iconMap.set("art", "paint-brush");
    iconMap.set("food", "cutlery");
    iconMap.set("entertainment", "game-pad");
    iconMap.set("local-news", "newspaper-o");
    iconMap.set("local-events", "ticket");
    iconMap.set("resource-listing", "wrench");
    iconMap.set("crisis-support", "phone");
    iconMap.set("support-groups", "users");
    iconMap.set("third-space", "gratipay");

    let resourcesAndTagsMap = new Map();

    let resourceList = [];
    let tagArray = [];

    let toKebabCase = function (str) {
        return str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
        .trim() // Trim leading/trailing spaces
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
    }            

    let dedupeAndSort = function (arr) {
        return [...new Set(arr)].sort();
    }

    let alphabetizeArray = function(arr, key) {
        return arr.sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];

            if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueA.localeCompare(valueB);
            } else if (typeof valueA === 'number' && typeof valueB === 'number'){
                return valueA - valueB;
            } else {
            return 0;
            }
        });
    }

    let createFilters = function() {
        resourceList.forEach(function(item){
            //create an array of tags per resource
            let localTagArray = [];

            //dump all of the tags for all resources into one big array
            item.tags.forEach(function(tag){
                tagArray.push(tag);
                localTagArray.push(toKebabCase(tag));
            });
            
            //create a map of all resources and their tag array
            resourcesAndTagsMap.set(toKebabCase(item.title),localTagArray);
        });
        //dedupe and sort the array by alpha
        tagArray = dedupeAndSort(tagArray);

        //loop through tagArray and create a filter list
        let msg = '';
        tagArray.forEach(function(item) {
            msg += `
                <li class="tag ${toKebabCase(item)} ${colorTagMap.get(toKebabCase(item))}"><label><input type="checkbox" class="filter" data-tag="${toKebabCase(item)}" checked> ${item}</li>
            `;
        });

        console.log(resourcesAndTagsMap);
        $('.filter-list').html(msg);
    }

    let createResourceList = function() {

        resourceList.forEach(function(item) {
            let tagBullets = '';
            let localTagArray = [];

            item.tags.forEach(function(tag){
                localTagArray.push(toKebabCase(tag));
                tagBullets += `

                    <li class="tag ${toKebabCase(tag)} ${colorTagMap.get(toKebabCase(tag))}"><i class="fa fa-${iconMap.get(toKebabCase(tag))}" aria-hidden="true"></i> ${tag}</li>
                `;
            });
            
            let msg = `
            <div class="resource" data-tags="${localTagArray.join(',')}">
                    <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                    ${(item.phone) ? '<p><i class="fa fa-phone"></i> <a href="tel:' + item.phone + '">'+item.phone+'</a></p>' : ''
                    } 
                    <p>${item.description}</p>
                    <ul class="tags">
                        ${tagBullets}
                    </ul>
                    <hr>
                </div>
            `;
            $('.resources').append(msg);
        });
        
    }

    //pull in json resource and create filters and content based on it
    $.ajax({
        url : '/json/resources.json',
        success : function (data) {
            resourceList = data.resources;
            alphabetizeArray(resourceList, 'title');
            createFilters();
            createResourceList();
        }
    });

    //checkbox filters           

    $('.filters').on('click', 'input.filter', function(e){
        applyFilters();
    });

    let toggled = true;

    $('.filter-toggle').on('click', function(e) {
        e.preventDefault();
        if(toggled) {
            $('.filters input.filter').prop('checked', false);
        } else {
            $('.filters input.filter').prop('checked', true);
        }
        toggled = !toggled;
        applyFilters();
    });            

    let applyFilters = function() {
        let visibleTags = [];
        //get an array of all tags that should be visible
        $('.filters input.filter:checked').each(function(item){
            visibleTags.push($(this).data('tag'));
        });

        //loop through each resource, make an array from the data-tag attr, 
        $('.resource').each(function() {
            localTagArray = $(this).data('tags').split(',');
            if(visibleTags.some(element => localTagArray.includes(element))){
                $(this).show('fast');
            } else {
                $(this).hide('fast');
            }
        });
    }
});