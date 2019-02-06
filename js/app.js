var map; 
function viewModel(){
	var self = this;
	var markers = new Array();
	this.searchText = ko.observable("");
	this.dataAvailable = ko.observable(false);
	var infowindow = new google.maps.InfoWindow({});
	var marker;

	//Set iformation window content for list
	this.setInfoWindowContent = function(marker){
		var infowindowContent = '<p>' + self.currentLocaton().name + '</p>';
        	infowindowContent += '<p>User rating:' + self.currentLocaton().rating + '</p>';
        	infowindow.setContent(infowindowContent);
			infowindow.open(map, marker);
	};

	//Change marker when list items are clicked
	this.changeLocation = function(item){
		if(self.currentLocaton == item)
			return;
		self.currentLocaton(item);
		marker = markers[self.currentLocaton().id-1];
		if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 750);
        }
		self.setInfoWindowContent(marker);
	};

	//Populates list when data has been fetched from API and when search text is modified in fiter
	this.filteredLocations = ko.computed(function(){
    	var filteredList = [];
    	if(this.dataAvailable()){
    		for(i=0;i<markers.length; i++){
    			var selectedMarker = markers[i];
    			if(selectedMarker.name.toLowerCase().includes(this.searchText().toLowerCase())) {
                	filteredList.push(selectedMarker);
                	markers[i].setVisible(true);
            	} else {
                markers[i].setVisible(false);
            	} 
    		}
    	}
    	return filteredList;
    }, this);

 	this.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {lat: 37.4011695, lng: -122.0135755}
        });

        //Fetches restaurant data using Zomato API
		var url = "https://developers.zomato.com/api/v2.1/geocode?lat=37.4011695&lon=-122.0135755";
		fetch(url , {
      		method: "GET",
      		headers: {
        		"Accept": "application/json",
        		"user-key": "5b8fc9e58f549c2195fdff781cf50b8e",
      		},
    	}).then(function(response) {
    		return response.json();
		})
		.then(function(myResponse) {
        	for (i = 0; i < myResponse.nearby_restaurants.length; i++) {
            	marker = new google.maps.Marker({
            		position: new google.maps.LatLng(myResponse.nearby_restaurants[i].restaurant.location.latitude, 
            		myResponse.nearby_restaurants[i].restaurant.location.longitude),
            		map: map,
            	animation: google.maps.Animation.DROP,
         		name: myResponse.nearby_restaurants[i].restaurant.name,
         		lat: myResponse.nearby_restaurants[i].restaurant.location.latitude,
				lng: myResponse.nearby_restaurants[i].restaurant.location.longitude,
				rating: myResponse.nearby_restaurants[i].restaurant.user_rating.aggregate_rating,
        		id: i+1});

       			google.maps.event.addListener(marker,'click', (function (marker, i) {
					return function () {
						var infowindowContent = '<p>' + myResponse.nearby_restaurants[i].restaurant.name + '</p>';
        				infowindowContent += '<p>User rating:' + myResponse.nearby_restaurants[i].restaurant.user_rating.aggregate_rating + '</p>';
        				infowindow.setContent(infowindowContent);
						infowindow.open(map, marker);
					}
				})(marker, i))

       			markers.push(marker);
     		}
     		self.dataAvailable(true);
        })
        .catch(function(error) {
  			alert('There has been a problem with fetching restaurant data');
		});	
		this.currentLocaton = ko.observable(markers[0]);
    };
    this.initMap();
}
function start() {
	ko.applyBindings(new viewModel());
}