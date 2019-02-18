
function districtChart(district, dataObj){
    let BLACK = "#000000"

    let reockColor = findColor(`.reockAnalysis.boxable${district}`) || BLACK;
    let polsbyPopperColor = findColor(`.polsbyAnalysis.boxable${district}`) || BLACK;
    let schwartzbergColor = findColor(`.schwartzbergAnalysis.boxable${district}`) || BLACK;
    let xSymmetryColor = findColor(`.xSymmetryAnalysis.boxable${district}`) || BLACK;
    let lengthWidthColor = findColor(`.lengthWidthAnalysis.boxable${district}`) || BLACK;
    let convexHullColor = findColor(`.convexHullAnalysis.boxable${district}`) || BLACK;

    var barChart = c3.generate({
        title: {
            text:`District ${district} Scores`
        },
        bindto: '#barChart',
        data: {
            type: 'bar',
            columns: [
                ['Reock', dataObj[district]['Reock'].toFixed(3)],
                ['PolsbyPopper', dataObj[district]['PolsbyPopper'].toFixed(3)],
                ['Schwartzberg', dataObj[district]['Schwartzberg'].toFixed(3)],
                ['ConvexHull', dataObj[district]['ConvexHull'].toFixed(3)],
                ['LengthWidth', dataObj[district]['LengthWidth'].toFixed(3)],
                ['XSymmetry', dataObj[district]['XSymmetry'].toFixed(3)]
            ],
            keys: {
                x: 'indicator',
                value: ['score']
            },
            colors: {
                Reock: reockColor,
                PolsbyPopper: polsbyPopperColor,
                Schwartzberg: schwartzbergColor,
                XSymmetry: xSymmetryColor,
                LengthWidth: lengthWidthColor,
                ConvexHull: convexHullColor
            },
            labels: true
        },
        axis: {
            x: {
                type: 'category'
            },
            y: {
                max: 1,
                min: 0,
                padding: {top:0, bottom:0}
            }
        },
        bar: {
            width: {
                ratio: .9
            }
        }
    });
}

function averageChart(district, dataObj){
    if($('#map').attr('data-maptype')){
        var metric = $('#map').attr('data-maptype');
    } else {
        return;
    }

    let average = 0;

    for(var dist in dataObj){
        average += dataObj[dist][metric]
    }

    average = average / Object.keys(dataObj).length;

    var lengthwidthBarChart = c3.generate({
        title: {
            text: `District ${district} ${metric}`
        },
        bindto: '#lengthwidthBarChart',
        data: {
            type: 'bar',
            columns: [
                ['District', dataObj[district][metric].toFixed(3) ],
                ['State Average', average.toFixed(3) ]
            ],
            colors: {
                District: '#000080',
                StateAverage: '#5518ab'
            },
            keys: {
                x: 'indicator',
                value: ['score']
            },
            labels: true
        },
        axis: {
                x: {
                    type: 'category'
                },
                y: {
                    max: 1,
                    min: 0,
                    padding: {top:0, bottom:0}
                }
        },
        bar: {
            width: {
                ratio: .9
            }
        }
    });

}

function findColor(className){
    if ($(className).attr("data-color") == "good"){
        return '#006400';
    }
    else{
        return '#8b0000';
    }
}
