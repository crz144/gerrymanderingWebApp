
needs(maptools)
needs(ggplot2)
needs(RColorBrewer)
needs(rgdal)
needs(spdplyr)
needs(geojsonio)
needs(rmapshaper)
needs(rgdal)
needs(spatstat)
needs(sp)
needs(geojson)
needs(dismo)
needs(rgeos)
needs(geosphere)
needs(geometry)

# library(maptools)
# library(ggplot2)
# library(RColorBrewer)
# library(rgdal)
# library(spdplyr)
# library(geojsonio)
# library(rmapshaper)
# library(rgdal)
# library(spatstat)
# library(sp)
#
# library(dismo)
# library(rgeos)
# library(geosphere)
# library(geometry)

### Read in Shape File
sf <- rgdal::readOGR(
  "public/shapefile/2017 House Redistricting Plan.shp"
)

# nc_counties <- readOGR("2017 House Redistricting Plan - Shapefile")


# sf <- rgdal::readOGR(
#   "shapefile/2017 House Redistricting Plan.shp"
# )

### Shape File as Matrix
suppressMessages(mapObject <- ggplot2::fortify(sf))
#mapObject <- ggplot2::fortify(sf)  # convert to a data.frame

mapObject <- data.frame(mapObject, sf@data[mapObject$id, ]) # add lables
mapObject$id <- mapObject$sf.data.mapObject.id...

mapObject$piece <- as.character(mapObject$piece)
districts       <- sort(unique(mapObject$id))

mapObject$MinBoundingCircleArea <- NA
mapObject$MinBoundingCirclePerim <- NA
mapObject$MinBoundingPolygonArea <- NA
mapObject$Width <- NA
mapObject$Height <- NA
mapObject$OverlappingArea <- NA


#
# Functions for calculating Boyce-Clark
#
## ... first a utility function that takes converts a two-column matrix of
## x-y coordinates (like that returned by geosphere::gcIntermediate)
## to a SpatialLines object (as needed by, e.g., rgeos::gIntersection) ...
xyMatToSL <- function(mat, prj=CRS("+proj=longlat")) {
  id <- paste0(sample(letters, 10), collapse = "")
  linesList <- list(Lines(Line(mat), ID = id))
  SpatialLines(linesList, proj4string = prj)
}

## ... and then a main function that computes a segment of a great
## circle beginning from a given focal point at a given initial
## bearing and travels until its first intersection with a line OR
## until it has gone maxDist meters.
focalToFirstGCIntersection <-
  function(focalPt, lineLayer, initBearing=80, maxDist=1e30) {
    ## Draw a long line from pt at an initial bearing
    destPt <- destPoint(focalPt, b = initBearing, d = maxDist)
    gcSegment <- xyMatToSL(gcIntermediate(focalPt, destPt, n=100, addStartEnd=TRUE))
    ## Find nearest points of intersection or, if none, return point at given distance
    candidatePts <- gIntersection(gcSegment, lineLayer)
    destPt <- if(is.null(candidatePts)) {
      destPt} else {candidatePts[which.min(spDists(focalPt, candidatePts))]}
    
    dm <- distm(c(destPt@bbox[2,1], destPt@bbox[1,1]), c(focalPt@bbox[2,1], focalPt@bbox[1,1]), fun = distHaversine)
    return(dm)
    ## Construct a line from point to it
    ##xyMatToSL(gcIntermediate(focalPt, destPt, addStartEnd=TRUE))
  }




for(cd in districts){  
  print(cd)
  
  cdShape <- mapObject[mapObject$id == cd, ]
  
  cdPoly <- sp::SpatialPolygons(
    list(sp::Polygons(lapply(split(cdShape[, c("long", "lat")],cdShape$piece), sp::Polygon), ID = "b"))
  )
  
  mapObject[mapObject$id == cd, "Area"] <- gArea(cdPoly)
  mapObject[mapObject$id == cd, "Perim"]<- spatstat::perimeter(cdPoly)
  
  mapObject[mapObject$id == cd, "Width"] <- cdPoly@bbox["x","max"] - cdPoly@bbox["x","min"]
  mapObject[mapObject$id == cd, "Height"] <- cdPoly@bbox["y","max"] - cdPoly@bbox["y","min"]
  
  # minimum bounding circle calculations
  xy <- mapObject[mapObject$id == cd, c("long","lat")]
  
  f <- function(p) { 
    max(pointDistance(rbind(p), xy, lonlat=FALSE)) 
  }
  
  p  <- optim(colMeans(xy), f)
  
  cc <- buffer(SpatialPoints(rbind(p$par)), width=p$value, quadsegs=45)
  mapObject[mapObject$id == cd,"MinBoundingCircleArea"] <- gArea(cc)
  mapObject[mapObject$id == cd,"MinBoundingCirclePerim"] <- spatstat::perimeter(cc)
  
  #owinObject <- try(spatstat::as.owin(cdPoly))  
  
  #owinObject <- try(as(cdPoly, "owin"))  
  
  #if(class(owinObject) == "try-error"){next()}  
  
  #mapObject[mapObject$id == cd, "Area"] <- spatstat::area.owin(owinObject)
  #mapObject[mapObject$id == cd, "Perim"] <- spatstat::perimeter(owinObject)
  
  # Get the minimum bounding circle of the district...
  #   this is needed to calculate the REOCK score. 
  # circumcircle <- function(x, ...) { 
  #   d2 <- spatstat::fardist(x, squared=TRUE) 
  #   z  <- spatstat::where.min(d2) 
  #   r  <- sqrt(min(d2)) 
  #   w  <- spatstat::disc(centre=z, radius=r) 
  #   return(w) 
  # } 
  # 
  # minBoundingCircle <- circumcircle(owinObject)
  # mapObject[mapObject$id == cd,"MinBoundingCircleArea"] <- spatstat::area.owin(minBoundingCircle)
  # mapObject[mapObject$id == cd,"MinBoundingCirclePerim"] <- spatstat::perimeter(minBoundingCircle)

  # Area of minimum bounding polygon
  idx <- chull(xy)
  cdMinPoly  <- sp::SpatialPolygons(
    list(sp::Polygons(lapply(split(cdShape[idx, c("long", "lat")],cdShape[idx,"piece"]), sp::Polygon), ID = "b"))
  )
  mapObject[mapObject$id == cd,"MinBoundingPolygonArea"] <- gArea(cdMinPoly)
  
  
  # X-Symmetry
  
  # reflect over the horizontal axis: plot to see e.g. plot(cdPoly); plot(cdPolyFlip)
  cdPolyFlip <- elide(cdPoly, reflect=c(FALSE, TRUE), scale=NULL)
  cdPolyIntersect <-  raster::intersect(cdPoly, cdPolyFlip)
  # plot(cdPoly, axes=T); plot(cdPolyFlip, add=T); plot(cdPolyIntersect, add=T, col='red')
  mapObject[mapObject$id == cd,"OverlappingArea"] <- gArea(cdPolyIntersect)
  
  
  
  # Boyce Clark
  
  egPoint <- gCentroid(cdPoly)
  egLines <- cdPoly
  
  ## Compute great circle segments of maximum length 40 km.
  thetas <- seq(10,360,by=20)
  
  # distanceLines <- unlist(lapply(thetas, function(X) {
  #   focalToFirstGCIntersection(egPoint, egLines, initBearing=X, maxDist=4000000)
  # }))
  
  
  ## Plot results
  #plot(egLines)
  #plot(outLines, col = "blue", lwd = 1.5, add = TRUE)
  #plot(egPoint, pch = 16, col = "gold", add =  TRUE)
  
}

# REOCK Score
mapObject$Reock <- mapObject$Area / mapObject$MinBoundingCircleArea

# The Polsby-Popper measure is the ratio of the area of the district to the
# area of a circle whose circumference is equal to the perimeter of the district.
#
#  AreaOfCircle = circumference^2 / (4*pi)
#mapObject$PolsbyPopper1 <- mapObject$Area /  (mapObject$Perim^2 / (4*pi))
mapObject$PolsbyPopper <- 4*pi*(mapObject$Area/mapObject$Perim^2 ) 

# The Schwartzberg measure is the ratio of the perimeter of the district to the
# circumference of a circle whose area is equal to the area of the district.
mapObject$Schwartzberg <- 1 / (mapObject$Perim / (2*pi*sqrt(mapObject$Area/pi) ))

# Convex Hull (Area of district / Area of Min Convex Polygon)
mapObject$ConvexHull <- mapObject$Area / mapObject$MinBoundingPolygonArea

# Length/Width
mapObject$LengthWidth <-  apply(cbind(mapObject$Height,  mapObject$Width), 1, min) / apply(cbind(mapObject$Height,  mapObject$Width), 1, max)

# X- Symmetry Thus, we define X-Symmetry by dividing
# the overlapping area, between a district and its reflection across the horizontal axis, by the
# area of the original district. Shapes like circles and rectangles have overlap regions equal
# to that of the original district and so have X-Symmetry values of 1. 
mapObject$XSymmetry <- mapObject$OverlappingArea / mapObject$Area

# Significant Corners

# Boyce-Clark

# sum(r_i/sum(all_ri) * 100-100/(length(all_ri)))
# range from zero to 200 with zero being the value for a circle.

# nc <- readOGR(
#   dsn = "public/shapefile",
#   layer = "2017 House Redistricting Plan", 
#   verbose = FALSE
# )

nc <- readOGR(
  dsn = "shapefile",
  layer = "2017 House Redistricting Plan",
  verbose = TRUE
)


nc <- spTransform(nc, CRS("+proj=longlat +datum=WGS84"))


add.data <- mapObject[
  !duplicated(mapObject$id),c("id",
    "Reock", 
    "PolsbyPopper", 
    "Schwartzberg",
    "ConvexHull",
    "LengthWidth",
    "XSymmetry") 
]

add.data$DISTRICT  <- add.data$id
add.data$id        <- NULL
add.data           <- merge(nc@data, add.data, by = "DISTRICT")

rownames(add.data) <- rownames(nc@data)

nc <- maptools::spCbind(nc,add.data[,-1])

nc_json <- geojson_json(nc)

nc_json_r <- ms_simplify(nc)

# suppressMessages(
#   geojson_write(
#       nc_json_r,
#       file = "public/ncr.geojson"
#   )
# )

#test <- as.geojson(nc_json_r)

#cat("unless directed to a file", file = "out.Rout")
#cat("unless directed to a file", file = "public/out.Rout")

suppressMessages(
  geojson_write(
      nc_json_r,
      file = "public/ncr2.geojson"
  )
)

nc_json_r



