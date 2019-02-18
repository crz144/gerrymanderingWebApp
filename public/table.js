
function initializeTable(dataObj){
    addTableBody(dataObj);
    defaultColors();
}

function addTableBody(dataObj){
    for(var district in dataObj){
        $('#districtTableBody')
          .append($('<tr></tr>').attr('id', district)
            .append($('<th></th').addClass(`matchTable boxable${district}`).text(district))
            .append($('<th></th').addClass(`reockAnalysis boxable${district}`).text(dataObj[district]['Reock'].toFixed(3)))
            .append($('<th></th').addClass(`polsbyAnalysis boxable${district}`).text(dataObj[district]['PolsbyPopper'].toFixed(3)))
            .append($('<th></th').addClass(`schwartzbergAnalysis boxable${district}`).text(dataObj[district]['Schwartzberg'].toFixed(3)))
            .append($('<th></th').addClass(`convexHullAnalysis boxable${district}`).text(dataObj[district]['ConvexHull'].toFixed(3)))
            .append($('<th></th').addClass(`lengthWidthAnalysis boxable${district}`).text(dataObj[district]['LengthWidth'].toFixed(3)))
            .append($('<th></th').addClass(`xSymmetryAnalysis boxable${district}`).text(dataObj[district]['XSymmetry'].toFixed(3)))
        );
      }

      var oTable = $('#districtTable').DataTable( {
        scrollY:        '40vh',
        scrollCollapse: true,
        paging:         false,
        fixedColumns:   true,
        select:         true,
        searching: false,
        columnDefs: [
            {
                className: 'mdl-data-table__cell--non-numeric'
            }
        ]
      } );
}

function defaultColors(){
    //default table color
    colorTable(".reockAnalysis", .289);
    colorTable(".polsbyAnalysis", .095);
    colorTable(".schwartzbergAnalysis", .308);
    colorTable(".convexHullAnalysis", .494);
    colorTable(".xSymmetryAnalysis", .6);
    colorTable(".lengthWidthAnalysis", .6);
}



function colorTable(metric, target){
    $(metric).each(function(){

      var colText = $(this).text();

      if(colText > target){
        $(this).attr('data-color', 'good');
      } else {
        $(this).attr('data-color', 'bad');
      }
    });
}

var reockDiv = 0;
var polsbyPopperDiv = 0;
var schwartzbergDiv = 0;
var convexHullDiv = 0;
var lengthWidthDiv = 0;
var xSymmetryDiv = 0;

function getBoundaryInput() {
  if (reockBoundary.value.length != 0) {
    reockDiv = Number($('#reockBoundary').val());
    colorTable(".reockAnalysis", reockDiv);
  }

  if (polsbyPopperBoundary.value.length != 0) {
    polsbyPopperDiv = Number($('#polsbyPopperBoundary').val());
    colorTable(".polsbyAnalysis", polsbyPopperDiv);
  }

  if (schwartzbergBoundary.value.length != 0) {
    schwartzbergDiv = Number($('#schwartzbergBoundary').val());
    colorTable(".schwartzbergAnalysis", schwartzbergDiv);
  }

  if (convexHullBoundary.value.length != 0) {
    convexHullDiv = Number($('#convexHullBoundary').val());
    colorTable(".convexHullAnalysis", convexHullDiv);
  }

  if (lengthWidthBoundary.value.length != 0) {
    lengthWidthDiv = Number($('#lengthWidthBoundary').val());
    colorTable(".lengthWidthAnalysis", lengthWidthDiv);
  }

  if (xSymmetryBoundary.value.length != 0) {
    xSymmetryDiv = Number($('#xSymmetryBoundary').val());
    colorTable(".xSymmetryAnalysis", xSymmetryDiv);
  }
}

function changeBoundary() {
    var boundarySelectResponse = document.getElementById("boundarySelect").value;
    if (boundarySelectResponse == "custom") {
      $('#boundaryType').html('<br>Enter custom 0-1 boundaries below:');
      $('#customBoundarySelect').show();
    }
    else if (boundarySelectResponse == "median") {
      $('#customBoundarySelect').hide();
      $('#boundaryType').html('<br>Now displaying ' + boundarySelectResponse + ' boundaries.<br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Reock:</p><p style="float:right;margin:0px;padding:0px;">0.500</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Polsby-Popper:</p><p style="float:right;margin:0px;padding:0px;">0.500</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Schwartzberg:</p><p style="float:right;margin:0px;padding:0px;">0.500</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Convex-Hull:</p><p style="float:right;margin:0px;padding:0px;">0.500</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Length-Width:</p><p style="float:right;margin:0px;padding:0px;">0.500</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">X-Symmetry:</p><p style="float:right;margin:0px;padding:0px;">0.500</p></div><br><br>');

      colorTable(".reockAnalysis", .5);
      colorTable(".polsbyAnalysis", .5);
      colorTable(".schwartzbergAnalysis", .5);
      colorTable(".convexHullAnalysis", .5);
      colorTable(".xSymmetryAnalysis", .5);
      colorTable(".lengthWidthAnalysis", .5);
    }
    else {
      $('#customBoundarySelect').hide();
      $('#boundaryType').html('<br>Now displaying ' + boundarySelectResponse + ' boundaries.<br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Reock:</p><p style="float:right;margin:0px;padding:0px;">0.289</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Polsby-Popper:</p><p style="float:right;margin:0px;padding:0px;">0.095</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Schwartzberg:</p><p style="float:right;margin:0px;padding:0px;">0.308</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Convex-Hull:</p><p style="float:right;margin:0px;padding:0px;">0.494</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">Length-Width:</p><p style="float:right;margin:0px;padding:0px;">0.384</p></div><br><br>' +
      '<div><p style="float:left;margin:0px;padding:0px;">X-Symmetry:</p><p style="float:right;margin:0px;padding:0px;">0.717</p></div><br><br>');
      colorTable(".reockAnalysis", .289);
      colorTable(".polsbyAnalysis", .095);
      colorTable(".schwartzbergAnalysis", .308);
      colorTable(".convexHullAnalysis", .494);
      colorTable(".xSymmetryAnalysis", .384);
      colorTable(".lengthWidthAnalysis", .717);
    }
}
