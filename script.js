
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

var autocomplete_start, autocomplete_end;
var place_start, place_end;

var calcButton = document.getElementById('calc');
var out = document.getElementById('out');



function run() {

  // Точка А и Б
  let start = document.getElementById("startPlace").value;
  let end = document.getElementById("endPlace").value;

  if (typeof(place_start) != 'undefined') {
    start = new google.maps.LatLng(place_start.geometry.location.lat(), place_start.geometry.location.lng());
  }
  if (typeof(place_end) != 'undefined') {
    end = new google.maps.LatLng(place_end.geometry.location.lat(), place_end.geometry.location.lng());
  }

  getDistanceToMkad(start, end);

}




// Рассчет минимального расстояния до МКАД

async function getDistanceToMkad(start, end) {

  let distanceArray = [];
  let arrayDistanceStart = [];
  let arrayDistanceEnd = [];

  for(let i = 0; i < mkadRoads.length; i++){
    if(isInPolygon(start, mkadPolygon)){
      let distance = await calcDistanceToMkad(end, mkadRoads[i]);
      distanceArray.push(distance);
    } else if(isInPolygon(end, mkadPolygon)){
      let distance = await calcDistanceToMkad(start, mkadRoads[i]);
      distanceArray.push(distance);
    } else {
      let distanceStart = await calcDistanceToMkad(start, mkadRoads[i]);
      let distanceEnd = await calcDistanceToMkad(end, mkadRoads[i]);
      arrayDistanceStart.push(distanceStart);
      arrayDistanceEnd.push(distanceEnd);
      distanceArray.push(Math.min(...arrayDistanceStart) + Math.min(...arrayDistanceEnd));
    }
  }

  if(distanceArray.length >= mkadRoads.length){
    minDistance = Math.min(...distanceArray);
    calcRoute(start, end, minDistance);
  }

}



// Вычисление расстояния до МКАД

function calcDistanceToMkad(start, end) {
  calcButton.disabled = true;
  calcButton.value = 'Идет рассчет...';
  out.innerHTML = '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
  return new Promise(resolve => {
    const request = {
      origin: start,
      destination: end,
      durationInTraffic: true,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        resolve(result.routes[0].legs[0].distance.value / 1000);
      } else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
        setTimeout(function () {
            calcDistanceToMkad(start, end).then(resolve);;
        }, 2000);
      }
    });
  })
} 





// Выполнение рассчета (принимает координаты точек А и Б и рассточние до МКАД)

function calcRoute(start, end, distanceToMkad){

  // Проверяем входит ли конечный (начальный) пункт зоны тарифа МКАД (true or false)
  let mkadStart = isInPolygon(start, mkadPolygon);
  let mkadEnd = isInPolygon(end, mkadPolygon);

  let request = {
    origin: start,
    destination: end,
    durationInTraffic: true,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function(result, status) {

    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);

      // Расстояние от А до Б
      let distance = result.routes[0].legs[0].distance.value / 1000;

      // Время в пути, минуты
      let travelTime = result.routes[0].legs[0].duration.value / 60;
      travelTime = travelTime + travelTime * 0.3;


      let innerHtml = '<div class="alert alert-info">';
      innerHtml += '<div>Расстояние: <b>' + Math.round(distance) + ' км</b></div>';
      innerHtml += '<div>Расстояние за МКАД: <b>' + Math.round(distanceToMkad) + ' км</b></div>';
      innerHtml += '<div>Время в пути: <b>' + Math.round(travelTime) + ' мин.</b></div>';
      innerHtml += '</div>';
      calcButton.disabled = false;
      calcButton.value = 'Рассчитать';
      out.innerHTML = innerHtml;


    } else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
      setTimeout(function () {
          calcRoute(start, end, distanceToMkad);
      }, 2000);
    } else {
      console.log(status);
      let innerHtml = '<div class="alert alert-warning" role="alert">Не удалось проложить маршрут. Попробуйте указать место поблизости или ввести название на другом языке. Обязательно выберите один из предложенных системой вариантов в выпадающем списке.</div>';
      out.innerHTML = innerHtml;
    }
  });

}




// Функция проверяет входит ли точка в зону МКАД

var isInPolygon = function(place, polygon) {
  if( google.maps.geometry.poly.containsLocation(place, polygon) ) {
    return true;
  } else {
    return false;
  }
}



// МКАД

var mkadCoordinates = [
  new google.maps.LatLng(55.834570,37.393453),
  new google.maps.LatLng(55.870030,37.404440),
  new google.maps.LatLng(55.880815,37.442892),
  new google.maps.LatLng(55.888518,37.482717),
  new google.maps.LatLng(55.906997,37.530783),
  new google.maps.LatLng(55.909306,37.545889),
  new google.maps.LatLng(55.910076,37.578848),
  new google.maps.LatLng(55.900838,37.615927),
  new google.maps.LatLng(55.896988,37.653005),
  new google.maps.LatLng(55.893908,37.687338),
  new google.maps.LatLng(55.889288,37.712057),
  new google.maps.LatLng(55.881586,37.723043),
  new google.maps.LatLng(55.842281,37.798574),
  new google.maps.LatLng(55.824543,37.838400),
  new google.maps.LatLng(55.779775,37.843893),
  new google.maps.LatLng(55.713300,37.835653),
  new google.maps.LatLng(55.689310,37.828787),
  new google.maps.LatLng(55.653686,37.837026),
  new google.maps.LatLng(55.636636,37.816427),
  new google.maps.LatLng(55.616477,37.779348),
  new google.maps.LatLng(55.593980,37.738150),
  new google.maps.LatLng(55.583115,37.701071),
  new google.maps.LatLng(55.572247,37.679098),
  new google.maps.LatLng(55.574576,37.598074),
  new google.maps.LatLng(55.593980,37.517050),
  new google.maps.LatLng(55.613375,37.488211),
  new google.maps.LatLng(55.638962,37.457998),
  new google.maps.LatLng(55.683117,37.419546),
  new google.maps.LatLng(55.713300,37.386587),
  new google.maps.LatLng(55.731089,37.378347),
  new google.maps.LatLng(55.765098,37.370108),
  new google.maps.LatLng(55.791358,37.372854)
];
var mkadOptions = {
  path: mkadCoordinates,
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#0000FF",
  fillOpacity: 0.6
};
var mkadPolygon = new google.maps.Polygon(mkadOptions);



// Точки дорог МКАД

var mkadRoads = [
  new google.maps.LatLng(55.906541, 37.543369),
  new google.maps.LatLng(55.909565, 37.588412),
  new google.maps.LatLng(55.894537, 37.673393),
  new google.maps.LatLng(55.883125, 37.727354),
  new google.maps.LatLng(55.830098, 37.829926),
  new google.maps.LatLng(55.813466, 37.836312),
  new google.maps.LatLng(55.776603, 37.841739),
  new google.maps.LatLng(55.743067, 37.845306),
  new google.maps.LatLng(55.729933, 37.840933),
  new google.maps.LatLng(55.711342, 37.839055),
  new google.maps.LatLng(55.708054, 37.834038),
  new google.maps.LatLng(55.689209, 37.824910),
  new google.maps.LatLng(55.656716, 37.840772),
  new google.maps.LatLng(55.590818, 37.730163),
  new google.maps.LatLng(55.577031, 37.686465),
  new google.maps.LatLng(55.576702, 37.596297),
  new google.maps.LatLng(55.610885, 37.491189),
  new google.maps.LatLng(55.637877, 37.457115),
  new google.maps.LatLng(55.662310, 37.431752),
  new google.maps.LatLng(55.713368, 37.383751),
  new google.maps.LatLng(55.730757, 37.371252),
  new google.maps.LatLng(55.766337, 37.367912),
  new google.maps.LatLng(55.791389, 37.372333),
  new google.maps.LatLng(55.832877, 37.394732),
  new google.maps.LatLng(55.882572, 37.444106),
  new google.maps.LatLng(55.888060, 37.484135)
]


// Инициализация 

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var thisCity = new google.maps.LatLng(55.751244, 37.618423);
  var myOptions = {
    zoom:10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: thisCity
  }
  map = new google.maps.Map(document.getElementById("map"), myOptions);
  directionsDisplay.setMap(map);

  var input_start = document.getElementById("startPlace");
  var input_end = document.getElementById("endPlace");

  var options = {
    componentRestrictions: {country:'ru'}
  }
  autocomplete_start = new google.maps.places.Autocomplete(input_start, options);
  google.maps.event.addListener(autocomplete_start, 'place_changed', function() {
    place_start = autocomplete_start.getPlace();
  });

  autocomplete_end = new google.maps.places.Autocomplete(input_end, options);
  google.maps.event.addListener(autocomplete_end, 'place_changed', function() {
    place_end = autocomplete_end.getPlace();
  });

  // mkadPolygon.setMap(map); // Рисуем МКАД на карте
	
  /*for( let i = 0; i < mkadRoads.length; i++ ){
    new google.maps.Marker({
       position: mkadRoads[i],
       map: map
    });
  }*/
            
}


// Запукс при загрузке DOM

window.onload = function(){

  initialize();

  calcButton.addEventListener('click', run);

}

