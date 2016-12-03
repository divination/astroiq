var astro = {};

function toItem(columns) {
	var data={
		lng:null,
		lat:null,
		ecl:null,
	};
	if (columns instanceof Array) {
		for (var i=0;i<columns.length;i++) {
			if (i<3) {
				var colVal = toDegrees(columns[i]).toFloat();
				switch (i) {
					case 0:
						data.lng = colVal;
						break;
					case 1:
						data.lat = colVal;
						break;
					case 2:
						data.ecl = colVal;
						break;
				}
			}
		}
	}
	return data;
}

function isNumeric(val) {
	if (typeof val == 'number') {
		return val !== NaN;
	} else if (typeof val == 'string') {
		return /^\s*-?\d+(\.\d+)?|\.d+\s*$/.test(val);
	}
	return false;
}

function Degree(degrees,minutes,seconds) {
	var hasMinutes = isNumeric(minutes);
	if (isNumeric(degrees)) {
		if (hasMinutes) {
			this.degrees = parseInt(degrees);
		} else {
			this.degrees = parseFloat(degrees);
		}
	} else {
		this.degrees = 0;
	}
	if (hasMinutes) {
		this.minutes = parseInt(minutes);
	} else {
		this.minutes = 0;
	}
	if (isNumeric(seconds)) {
		this.seconds = parseFloat(seconds);
	} else {
		this.seconds = 0;
	}
	this.toFloat = function() {
		return this.degrees + (this.minutes/60) + (this.seconds/60) 
	}
	this.decimal = this.toFloat();
	return this;
}

function toDegrees(string) {
	var degrees=0,minutes=0,seconds=0;
	if (typeof string == 'string') {

		var parts = string.split(','),numParts = parts.length,i=0;
		
		if (numParts >= 3) {
			for (;i<numParts;i++) {

				if (isNumeric(parts[i])) {

					var val = parseFloat(parts[i]);
					switch (i) {
						case 0:
							degrees = val;
							break;
						case 1:
							minutes = val;
							break;
						case 2:
							seconds = val;
							break;
					}
				}
			}
		}
	}

	return new Degree(degrees,minutes,seconds);	
}

function toNutation(columns) {
	var data=[];
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			if (val.length>2) {
				data.push(toDegrees(val).decimal);
			}
		}
	}
	return data;
}

function toUt(columns) {
	var data={value:null,delta:null,deltaType:'t',unit:'sec'};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			switch (i) {
				case 0:
					data.value = parseFloat(val);
					break;
				case 2:
					data.deltaType = val.split(':').shift();
					break;
				case 3:
					data.delta = parseFloat(val);
					break;
				case 4:
					data.unit = val.sanitize();
					break;
			}
		}
	}
	return data;
}

function toDateInfo(columns,type) {
	var data={date:null,time:null,calendar:null,zone:'UT',version:null};
	if (columns instanceof Array) {
		var numCols = columns.length,
			i=0,
			offset = type == 'date_dmy'? 0 : 1,
			val,dt;

		for (;i<numCols;i++) {
			val = columns[i].trim();
			switch (i) {
				case (0+offset):
					var parts = val.split('.');
					
					dt = parts.reverse().join('-')
					if (parts.length==3 && isNumeric(parts[2])) {
						data.date = new Date(dt);
					}
					break;
				case (1+offset):
					data.calendar = val;
					break;
				case (2+offset):
					if (/^\d+:\d+:\d+$/.test(val)) {
						var parts = val.split(':');
						data.time = val;
						data.date.setUTCHours(parts[0],parts[1],parts[2]);
					}
					break;
				case (3+offset):
					data.zone = val;
					break;
				case (5+offset):
					data.version = val;
					break;
			}
		}
	}
	return data;
}

function toSwetestParams(columns) {
	var params = {};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val,key;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			key = null;
			if (val.startsWith('-b')) {
				key = 'b';
			} else if (val.startsWith('-f')) {
				key = 'f';
			} else if (val.startsWith('-ut')) {
				key = 'ut';
			} else if (val.startsWith('-f')) {
				params.f = val.trim(/^-f/,'');
			} else if (val.startsWith('-geopos')) {
				key = 'geopos';
			} else if (val.startsWith('-topo')) {
				key = 'topo';
			} else if (val.startsWith('-house')) {
				key = 'house';
			}
			if (typeof key == 'string') {
				params[key] = val.replace(new RegExp('^-'+key),'');
			}
		}

	}
	return params;
}

function toEpsilon(columns) {
	var data={mode:false,value:null};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			switch (i) {
				case 0:
					val = val.sanitize();
					data.mode = true  == 'true';
					break;
				case 1:
					data.value = toDegrees(val).decimal;
					break;
			}
			val = columns[i].trim();
		}
	}
	return data;
}

function toGeo(columns) {
	var data={lat:null,lng:null,alt:null};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		if (columns.length>3) {
			if (columns[0] == 'long' && columns[2] == 'lat') {
				for (;i<numCols;i++) {
					val = columns[i].trim();
					switch (i) {
						case 1:
							data.lng = val.toFloat();
							break;
						case 3:
							data.lat = val.toFloat();
							break;
						case 5:
							if (isNumeric(val)) {
								data.alt = parseFloat(val);
							}
							break; 
					}
				}
			}
		}
		
	}
	return data;
}

function toHouse(columns) {
	var data={letter:"W",mode:""};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,
			modeCaptured=false,longIndex=5,latIndex=7,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();

			switch (i) {
				case 1:
					data.letter = val;
					break;
				case longIndex:
					data.lng = toDegrees(val).decimal;
					break;
				case latIndex:
					data.lat = toDegrees(val).decimal;
					break;
				default:
					if (i >= 2 && !modeCaptured) {
						if (i>2) {
							data.mode += " ";
						}
						data.mode += val
						if (val.endsWith(')')) {
							modeCaptured = true;
						} else {
							longIndex++;
							latIndex++;
						}
					}

					if (val.sanitize() == "long") {
						longIndex = i+1;
					} else if (val.sanitize() == "lat") {
						latIndex = i+1;
					}
					break;
			}
		}
	}
	return data;
}

function cleanLine(line) {
	return line.trim().replace(/(-?\d+)°\s{0,2}(-?\d+)'\s{0,2}(-?\d+)/g,'$1,$2,$3');
}

astro.model = {
	date: {},
	geo: {},
	astro: {},
	ayanamsa: {},
	houseData: {},
	houses: {},
	bodies: {},
	swetest: {}
};

astro.parseLine = (line,data, debug) => {
	var items = cleanLine(line).split(/\s+/),
		isCompoundKey=false, key,keyParts=[],subKey,firstKey;
  	if (items.length>1) {
  		key = items.shift().sanitize('_');
  		firstKey = key;
  		switch (key) {
  			case 'mean':
  			case 'true':
  			case 'house':
  			case 'osc':
  			case 'intp':
  				key += '_' + items.shift().toLowerCase();
  				break;
  		}

  		if (items[0].startsWith("(")) {
  			key += '_' + items.shift().sanitize("_");
  		}
  		
  		switch (key) {
  			case 'swetest':
  				if (debug) {
  					data[key] = toSwetestParams(items);
  				}
  				break;
  			case 'ut':
  				data[key] = toUt(items);
  				break;
  			case 'et':
  				data[key] = parseFloat(items[0]);
  				break;
  			case 'date':
  			case 'date_dmy':
  				data[key] = toDateInfo(items, key);
  				break;
  			case 'epsilon':
  				data[key] = toEpsilon(items);
  				break;
  			case 'sun':
			case 'moon':
			case 'mercury':
			case 'venus':
			case 'mars':
			case 'jupiter':
			case 'saturn':
			case 'uranus':
			case 'neptune':
			case 'pluto':
			case 'chiron':
			case 'pholus':
			case 'ceres':
			case 'pallas':
			case 'juno':
			case 'vesta':
			case 'cupido':
			case 'hades':
			case 'zeus':
			case 'kronos':
			case 'apollon':
			case 'admetos':
			case 'vulcanus':
			case 'poseidon':
			case 'isis_transpluto':
			case 'nxbiru':
			case 'nibiru':
			case 'harrington':
			case 'leverrier_neptune':
			case 'adams_neptune':
			case 'lowell_pluto':
			case 'pickering_pluto':
			case 'vulcan':
			case 'proserpina':
				data[key] = toItem(items);
				break;
			case 'houses':
				data[key] = toHouse(items);
				break;
			case 'geo':
				data[key] = toGeo(items);
				break;
			case 'nutation':
				data[key] = toNutation(items);
				break;
			case 'ayanamsa':
				var vals = toNutation(items);
				if (vals) {
					if (vals.length>0) {
						data[key] = vals[0];
					}
				}
				break;
			case 'mean_node':
			case 'true_node':
			case 'mean_apogee': 
			case 'osc_apogee':
			case 'intp_apogee':
			case 'intp_perigee':
			case 'epsilon_true':
				data[key] = toItem(items);
				break;
			default:
				switch (firstKey) {
					case 'house':
					case 'mc':
					case 'ascendant':
					case 'armc':
					case 'vertex':
						data[key] = toDegrees(items[0]).toFloat();
						break;
					default:
						data[key] = items;
						break;
				}
				break;
  		}
  	}
}



function valToGeoLine(val,key,data) {
	var item = "";
	if (typeof val == 'string') {
		val = val.split(',');
	}
	if (val instanceof Array && val.length >= 2) {
		item += val[0] + ',' + val[1];
		switch (key) {
			case "house":
				item += "," + data.system;
				break;
			case "geopos":
			case "topo":
				if (data.elev) {
					item += "," + data.elev;
				} else {
					item += ",0";
				}
				break;
		}
	}
	return item;
}

astro.composeSwetestQuery = (params) => {
	var paramParts = ["swetest"],
		data = {
		"b": "3.10.1963",
		"ut": "03.0000",
		"f": "PLEBS",
		"elev": 0,
		"system": "W",
		"sid": "0"
	},
	matched=true,item,val,tp;
	if (typeof params == 'object') {
		for (key in params) {
		if (data[key]) {
				data[key] = params[key];
			}
		}
	}
	if (params.topo) {
		data.topo = params.topo;
	} else if (params.geopos) {
		data.geopos = params.geopos;
	} 

	for (key in data) {
		item = "-" + key;
		val = data[key];
		tp = typeof val;
		matched = true,
		elev = 0;
		switch (key) {
			case "system":
			case "elev":
				matched = false;
				break;
			case "geopos":
			case "house":
			case "topo":
				if (data.elev) {
					if /^\s*\d+\s*$/.test(data.elev) {
						data.elev = parseInt(data.elev);
					}
				}
				item += valToGeoLine(val,key,data);
				break;
			case 'sid':
				if (tp == 'string') {
					if (/^\d+$/.test(val)) {
						val = parseInt(val);
						tp = typeof val;
					}
				}
				if (tp == 'number') {
					item += val.toString();
				} else {
					matched = false;
				}
				break;
			default:
				item += val;
				break;
		}
		if (matched) {
			paramParts.push(item);
		}
	}
	if (!data.house) {
		var coords;
		if (data.geopos) {
			coords = data.geopos;
		} else if (data.topo) {
			coords = data.topo;
		}

		if (coords){
			item = "-house" + valToGeoLine(coords,"house",data);
			paramParts.push(item);
			if (params.system) {
				if (typeof params.system == 'string') {
					var hsyV = "-hsy" + params.system.toUpperCase();
					paramParts.push(hsyV);
				}
			}

		}
	}
	return paramParts.join(" ");
};

astro.composeSwetestQueryAyanamsa = function(params) {
	var paramParts = ["swetest"],
		data = {
		"b": "3.10.1963",
		"ut": "03.0000",
		"f": "PLEBS",
		"topo": [0,0],
		"system": "W",
		"ay": "1"
	},
	matched=true,item,val;
	if (typeof params == 'object') {
		for (key in params) {
		if (data[key]) {
				data[key] = params[key];
			}
		}
	}
	for (key in data) {
		item = "-" + key;
		val = data[key];
		matched = true;
		switch (key) {
			case "system":
			case "elev":
				matched = false;
				break;
			case "geopos":
			case "house":
			case "topo":	
				item += valToGeoLine(val,key,data);
				break;
			default:
				item += val;
				break;
		}
		if (matched) {
			paramParts.push(item);
		}
	}
	return paramParts.join(" ");
}

astro.parseOutput = (stdout,debug) => {
  var lines = stdout.split(/\n/),
    data={};
    
  for (var i=0;i< lines.length;i++) {
  	if (typeof lines[i] == 'string') {
  		astro.parseLine(lines[i],data, debug);
  	}
  }
  return data;
}

astro.fetchData = (stdout,debug) => {
	var data = astro.parseOutput(stdout,debug),
		isHouse=false,parts=[],subK;
	var m = astro.model;
	m.houses={};
	for (k in data) {
		isHouse = k.indexOf('house_') === 0;
		if (isHouse) {
			parts = k.split("_");
			if (parts.length > 1) {
				subK = parts.pop();
				m.houses[subK] = data[k];
			}
			
		} else {
			switch (k) {
				case 'date_dmy':
					m.date = data[k];
					break;
				case 'houses':
					m.houseData = data[k];
					break;
				case 'geo':
					m.geo = data[k];
					break;
				case 'sun':
				case 'moon':
				case 'mercury':
				case 'venus':
				case 'mars':
				case 'jupiter':
				case 'saturn':
				case 'uranus':
				case 'neptune':
				case 'pluto':
				case 'chiron':
				case 'pholus':
				case 'ceres':
				case 'pallas':
				case 'juno':
				case 'vesta':
				case 'cupido':
				case 'hades':
				case 'zeus':
				case 'kronos':
				case 'apollon':
				case 'admetos':
				case 'vulcanus':
				case 'poseidon':
				case 'isis_transpluto':
				case 'nxbiru':
				case 'nibiru':
				case 'harrington':
				case 'leverrier_neptune':
				case 'adams_neptune':
				case 'lowell_pluto':
				case 'pickering_pluto':
				case 'vulcan':
				case 'proserpina':
					m.bodies[k] = data[k];
					break;
				case 'swetest':
					m.swetest = data[k];
					break;
				default: 
					var dt = typeof data[k];
					switch (dt) {
						case 'object':
							m.astro[k] = data[k];
							break;
						default:
							m.astro[k] = data[k];
							break;
					}
					
					break;
			}
		}
	}
	return m;
}


module.exports = astro;