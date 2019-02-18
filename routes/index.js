let express = require('express');
let router = express.Router();
let R = require("r-script");
let fs = require("fs");
/* GET home page. */
router.get('/', function(req, res){
    res.render('home.ejs', {title: 'Geographic Gerrymandering Detection'});
});



router.get('/map', function(req, res, next) {
     var ncrGeoText = JSON.parse(fs
        .readFileSync("public/ncr.geojson", 'utf8')
        .replace(/&#34;/g, '"'))['features']
        .reduce((total, current) => {
            total[current.properties.DISTRICT] = current.properties;
            return total;
        }, {});

    for (var district in ncrGeoText){
        console.log(district)
    }

    res.render('index', { title: 'Geographic Gerrymandering Detection', 
                            var1: 10, 
                            vec1: 20, 
                            geoDump: JSON.stringify(ncrGeoText).toString()
                        });
});

module.exports = router;