$(function() {
    var table = $('#result_table');
    var removenull_table = $('#removenull_result_table');
    var normalization_result_table = $('#normalization_result_table');

    document.getElementById("submitForm").addEventListener("submit", function(e){
        e.preventDefault();
        let csv_string = document.getElementById("csv_string");
        let arr = csv_to_array(csv_string.value);
        
        if(arr.length > 0)
        {
            if ($.fn.DataTable.isDataTable(table)) {
                $(table).DataTable().destroy();
                $(table).empty();
            }
            toDataTable(table,arr);
            if ($.fn.DataTable.isDataTable(removenull_table)) {
                $(removenull_table).DataTable().destroy();
                $(removenull_table).empty();
            }
            data = fillCell(removeEmptyRow(arr))
            toDataTable(removenull_table,data);
            if ($.fn.DataTable.isDataTable(normalization_result_table)) {
                $(normalization_result_table).DataTable().destroy();
                $(normalization_result_table).empty();
            }
            normalizationData = NormalizationZScore(data)
            toDataTable(normalization_result_table,normalizationData);
        }else{
            alert("Error: Not the format of the CSV file")
        }
        
        
    });   
    
    $("a[data-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
        $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    });
});


function csv_to_array(csv){

    var lines = csv.split("\n");
    var result = [];
    var headers;
    headers = lines[0].split(",");
    try{
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        if(lines[i] == undefined || lines[i].trim() == "") {
            continue;
        }
        var words = lines[i].split(",");
        for(var j = 0; j < words.length; j++) {
            if(/[\"'](.+)[\"']$/.test(words[j].trim()) )
            {
                obj[headers[j].trim()] = (words[j].replace(/[\"'](.+)[\"']$/,'$1').length > 0 ? words[j].replace(/[\"'](.+)[\"']$/,'$1') : null);
            }else if(/^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$/.test(words[j].trim())){
                obj[headers[j].trim()] = Number(words[j]);
            }else{
                
                if(isNaN(parseInt(words[j])))
                {
                    if(words[j].trim().length > 0)
                        obj[headers[j].trim()] = words[j].trim()
                    else
                        obj[headers[j].trim()] = null
                }else{
                    obj[headers[j].trim()] = Number(words[j]);
                }
                
            }
        }


        result.push(obj);
    }}
    catch(e){
        return null;
    }
    return result;
}


  function toDataTable(obj,data){
    var columns = [];
    columnNames = Object.keys(data[0]);
    for (var i in columnNames) {
      columns.push({data: columnNames[i], 
                    title: capitalizeFirstLetter(columnNames[i])});
    }
    obj.DataTable( {
		data: data,
        columns: columns,
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 
        ],
        language: {
            searchPanes: {
                emptyPanes: 'There are no panes to display. :/'
            }
        }
	});
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function removeEmptyRow(obj) {
    columnNames = Object.keys(obj[0]);
    columnNames.forEach(element => {
        x = obj.map(x => x[element])
        if(x.every(i => (i == null || i === "")))
        {
            obj = obj.map(val => {
                delete val[element]
                return val
            })
        }
    });
    Object.keys(obj).forEach(function(key) {
      if(obj[key] && typeof obj[key] === 'object'){
        let count = 0;
        Object.keys(obj[key]).forEach(function(prop) {
            if(obj[key][prop] === '' || obj[key][prop] === null || obj[key][prop] === undefined){
                count++;
            }
        });
        if(count == Object.size(obj[key]))
            obj.splice(key, 1);
      }
    });

    return obj;
  };

  function fillCell(obj) {
    let ArrCol = {};
    let ArrColStr = {};
    columnNames = Object.keys(obj[0]);
    columnNames.forEach(element => {
        ArrCol[element] = obj.map(x => x[element])
        ArrColStr[element] = countDuplicate(obj.map(x => x[element]))
    });
    
    Object.keys(obj).forEach(function(key) {
      if(obj[key] && typeof obj[key] === 'object'){
        Object.keys(obj[key]).forEach(function(prop) {
            if(obj[key][prop] === '' || obj[key][prop] === null || obj[key][prop] === undefined){
                if(checkAllArrayIsNumber(ArrCol[prop]))
                {
                    obj[key][prop] = Math.round(ArrCol[prop].reduce((a, b) => a + (b == null ?0:b), 0) / (ArrCol[prop].reduce((total,x) => (x != null ? total+1 : total), 0)) * 100) / 100 || 0;
                }else{
                    obj[key][prop] = findKeyMin(ArrColStr[prop])
                    columnNames.forEach(element => {
                        ArrColStr[element] = countDuplicate(obj.map(x => x[element]))
                    });
                }
            }
        });
      }
    });
    return obj;
  };

function NormalizationZScore(obj){
    columnNames = Object.keys(obj[0]);
    columnNames.forEach(element => {
        x = obj.map(x => x[element])
        if(checkAllArrayIsNumber(x))
        {
            arr = zScore(x)
            arr.forEach(function (val,index){
                obj[index][element] = val
            })
        }
    });
    return obj
    // Object.keys(obj).forEach(function(key) {
    //     if(obj[key] && typeof obj[key] === 'object'){
    //       Object.keys(obj[key]).forEach(function(prop) {
              
    //       });
    //     }
    // });
    
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function checkAllArrayIsNumber(x) {
    return x.every(i => (typeof i === "number" || i == null || i === ""));
}

function countDuplicate(arr)
{
    var counts = {};
    arr.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
    return counts
}

function findKeyMin(arr){
    let result;
    let min;
    Object.keys(arr).forEach(function(key) {
        if(key !== "null")
        {
        result = key;
        min = arr[key];
        return;
        }
    });
    
    Object.keys(arr).forEach(function(key) {
        if(arr[key] < min && key !== "null")
        {
            result = key;
            min = arr[key]; 
        }
    });
    return result;
}


/**
 * @function standardDeviation
 * Standard Deviation in Array
 * 
 * @param {*} arr 
 * @returns number
 */
function standardDeviation(arr){
    let sum = arr.reduce((a, b) => a + b,0);
    let mean = sum/arr.length;
    let sum2 = arr.map(x => (x-mean)**2).reduce((a, b) => a + b,0);
    let variance = sum2/(arr.length-1);
    return Math.sqrt(variance);
}

/**
 * @function zScore
 * Caculator z-score in array  
 * 
 * @param {*} arr 
 * @returns array
 */
function zScore(arr){
    let sD = standardDeviation(arr);
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = (sum / arr.length) || 0;
    return arr.map(x => (sD == 0 ? avg : (x - avg)/sD))
}

