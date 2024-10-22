export default function requestParser (socketData) {
	try {
		let stringRequest = socketData.toString('utf-8');
		let theEnd = "\r\n\r\n";
		
		let matched = stringRequest.match(/[\r\n]{4}/);

		let lastOfHeader = matched !== null? matched.index : stringRequest.indexOf(theEnd, 3);
		
		if(lastOfHeader < 3 || !Buffer.isBuffer(socketData)) return false;
		const body = Array.from(socketData).filter((el, index)=> index >= lastOfHeader+theEnd.length);

		stringRequest = stringRequest.split("").filter((el, index)=> index < lastOfHeader+theEnd.length).join('');
	
		let obRequest = {
			method: '',
			path: '/',
			htWithVersion: '',
			headers: {},
			headerLength: 0,
			body
		};
		obRequest.headerLength = stringRequest.length;

		let isFirst = true;
		for (let line of stringRequest.split("\r\n")) {
			if(isFirst) {
				let spaceIndex = line.indexOf(" ");
				obRequest.method = line.split('').filter((el, index)=> index < spaceIndex).join('');
				line = line.replace(obRequest.method, "").trim();
				spaceIndex = line.indexOf(" ");
				obRequest.path = line.split('').filter((el, index)=> index < spaceIndex).join('');
				line = line.replace(obRequest.path, "").trim();
				obRequest.htWithVersion = line;
				isFirst = false;
			}
			else {
				let twoPointIndex = line.indexOf(":");
				let key = line.split('').filter((el, index)=> index < twoPointIndex).join('');
				line = line.replace(key+":", "").trim();
	
				if((/accept/i).test(key)) obRequest.headers[key.toLowerCase()] = line.split(',');
				else if (key.toLowerCase() == 'sec-ch-ua') {
					line = "{" + line.replace(/\;v\=\"/g, ":\"v") + "}";
					obRequest.headers[key.toLowerCase()] = JSON.parse(line);
				}
				else if (key.toLowerCase() == 'sec-ch-ua-platform') obRequest[key.toLowerCase()] = line.replace(/\"/g, "");
				
				else obRequest.headers[key.toLowerCase()] = line;
			}
	
		}

		return obRequest;
	} catch (error) {
		return false;
	}
}