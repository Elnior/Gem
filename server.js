import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import Anully from './reqParser.js'; // Anully Standard v1.0.3

const pathAccess = Symbol("pathAccess");
// the default path
let direction = "./sources/here";

process.title = "Gem Online < | > v1.0.0";

function delay (time) {
	return new Promise ((resolve, reject)=> 
		setTimeout(resolve, time)
	);
}
function generateCode () {
	let codeGenerated = "";
	let letters = [];
	for (let i = 97; i <= 122; i++)
		letters.push( Math.ceil(Math.random()*777)%2 == 0? String.fromCharCode(i) : String.fromCharCode(i).toUpperCase());

		let arrTime = [];

		let index = Math.ceil(Math.random()*(letters.length-1));

		for (let posArr = 0; posArr <= 25; posArr++) {
			let lastEl = arrTime.pop();
			if(lastEl)
				codeGenerated+= lastEl+letters[index];
			else
				codeGenerated+= Math.ceil(Math.random()*9)+letters[index];

			index++;
			if(index < letters.length) {}
			else index = 0;
		}
	return codeGenerated;
}
class DataHandler {
	isFirstData = true;
	dataCollection = new Set();
	static streamMatriz = new Map();
	static parseQueryString (stringData) {
		const obj = {
			[pathAccess]: ""
		};
		let ready = false;
		let complete = "";
		for (let char of stringData) {
			if (ready) complete += char;
			else if (char == "?") 
				ready = true;
			else 
				obj[pathAccess] += char;
		}
		let all = complete.split("&");
		for (let element of all) {
			let [key, value] = element.split("=");
			obj[key] = value;
		}
		return obj;
	}
}

async function dispatch (obR, socket, moreData) {
	obR.path = decodeURI(obR.path);
	switch (obR.method.toLowerCase()) {
		case 'get':
			if (obR.path == "/") {
				socket.write(
					"HTTP/1.1 306 Redirect\r\n" +
					"Content-Location:/home/\r\n" +
					"content-type: text/html\r\n" +
					"date: this moment\r\n" +
					"server: NElniorS\r\n\r\n"
				);
				socket.write("<html> <head> <script> window.location.href = \"/home/\"</script> </head> <body></body> </html>");
				socket.end();
			}
			else if (obR.path == "/home" || obR.path == "/home/")
				fs.exists("./doc.html", isReady => {
					if (isReady) {
						let streamOfFile = fs.createReadStream("./doc.html");
						socket.write(
							"HTTP/1.1 200 Ok\r\n" +
							"content-type: text/html\r\n" +
							`date: ${Date.now()}\r\n` +
							"server: NElniorS\r\n\r\n"
						);
						streamOfFile.pipe(socket);
					}
					else {
						let message = Buffer.from(`Error (512): An error has ocurred`, "utf-8");
						socket.write(
							"HTTP/1.1 512 internal error\r\n" +
							"content-type: text/txt\r\n" +
							`content-length: ${message.byteLength}\r\n` +
							"date: this moment\r\n" +
							"server: NElniorS\r\n\r\n"
						);
						socket.write(message);
						socket.end();
					}
				});
			else if (obR.path == "/favicon.ico" || obR.path == "/icon.png")
				fs.exists("./gem-icon.png", isReady => {
					if (isReady) {
						let streamOfFile = fs.createReadStream("./gem-icon.png");
						socket.write(
							"HTTP/1.1 200 Ok\r\n" +
							"content-type: image/png\r\n" +
							`date: ${Date.now()}\r\n` +
							"server: NElniorS\r\n\r\n"
						);
						streamOfFile.pipe(socket);
					}
					else {
						let message = Buffer.from(`Error (512): An error has ocurred`, "utf-8");
						socket.write(
							"HTTP/1.1 512 internal error\r\n" +
							"content-type: text/txt\r\n" +
							`content-length: ${message.byteLength}\r\n` +
							"date: this moment\r\n" +
							"server: NElniorS\r\n\r\n"
						);
						socket.write(message);
						socket.end();
					}
				});
			else
				fs.exists("./notValid.html", isReady => {
					let simplify = obR.path.split("/").filter(el=> el !== "home").join("/");
				 
					fs.stat(`${direction}${simplify}`, function (posibleError, stat) {
						if (posibleError) {
							// it's here
							if (isReady) {
								let streamOfFile = fs.createReadStream("./notValid.html");
								socket.write(
									"HTTP/1.1 404 Not found\r\n" +
									"content-type: text/html\r\n" +
									`date: ${Date.now()}\r\n` +
									"server: NElniorS\r\n\r\n"
								);
								streamOfFile.pipe(socket);
							}
							else {
								let message = Buffer.from(`Error (512): An error has ocurred`, "utf-8");
								socket.write(
									"HTTP/1.1 512 internal error\r\n" +
									"content-type: text/txt\r\n" +
									`content-length: ${message.byteLength}\r\n` +
									"date: this moment\r\n" +
									"server: NElniorS\r\n\r\n"
								);
								socket.write(message);
								socket.end();
							}
						}
						else {
							if (stat.isFile())
								fs.readFile("./mimetypeList.json", function (error, buffer) {
									if (error) {
										let message = Buffer.from(`I have an internal error (533)`, "utf-8");
										socket.write(
											"HTTP/1.1 533 crashed root\r\n" +
											"content-type: text/txt\r\n" +
											`content-length: ${message.byteLength}\r\n` +
											"date: this moment\r\n" +
											"server: NElniorS\r\n\r\n"
										);
										socket.write(message);
										socket.end();
									}
									else {
										const LIST = JSON.parse(buffer.toString("utf-8"));
										let fmt = path.extname(`${direction}${simplify}`);
										let done = false;
										for (let { contyp, format } of LIST) {
											if (fmt.toLowerCase() == format.toLowerCase()) {
												let streamOfFile = fs.createReadStream(`${direction}${simplify}`);
												socket.write(
													"HTTP/1.1 200 Ok\r\n" +
													`content-type: ${contyp}\r\n` +
													`content-length: ${stat.size}\r\n` +
													`date: ${Date.now()}\r\n` +
													"server: NElniorS\r\n\r\n"
												);
												streamOfFile.pipe(socket);
												done = true;
												break;
											}
										}
										if (!done) {
											let streamOfFile = fs.createReadStream(`${direction}${simplify}`);
												socket.write(
													"HTTP/1.1 200 Ok\r\n" +
													`content-type: octet/stream\r\n` +
													`date: ${Date.now()}\r\n` +
													"server: NElniorS\r\n\r\n"
												);
												streamOfFile.pipe(socket);
										}
									}
								});
							else {
								let streamOfFile = fs.createReadStream("./doc.html");
								socket.write(
									"HTTP/1.1 200 Ok\r\n" +
									"content-type: text/html\r\n" +
									`date: ${Date.now()}\r\n` +
									"server: NElniorS\r\n\r\n"
								);
								streamOfFile.pipe(socket);
							}
						}
					});// end
				});
		break;

		case 'checkout':
			let simplify = obR.path.split("/").filter(el=> el !== "home").join("/");
			if (obR.path == "/home" || obR.path == "/home/")
				fs.readdir(direction, function(error, list){
					if (error) {
						let message = Buffer.from(`The root is not found.`, "utf-8");
						socket.write(
							"HTTP/1.1 513 crashed root\r\n" +
							"content-type: text/txt\r\n" +
							`content-length: ${message.byteLength}\r\n` +
							"date: this moment\r\n" +
							"server: NElniorS\r\n\r\n"
						);
						socket.write(message);
						socket.end();
					}
					else {
						let data = Buffer.from(JSON.stringify(list), "utf-8");
						socket.write(
							"HTTP/1.1 206 ready\r\n" +
							"content-type: application/json\r\n" +
							`content-length: ${data.byteLength}\r\n` +
							"date: this moment\r\n" +
							"server: NElniorS\r\n\r\n"
						);
						socket.write(data);
						socket.end();
					}
				});
			else 
				fs.stat(`${direction}${simplify}`, function (posibleError, stat) {
					if (posibleError) {
						let message = Buffer.from(`this direction is not valid!`, "utf-8");
						socket.write(
							"HTTP/1.1 422 invalid\r\n" +
							"content-type: text/txt\r\n" +
							`content-length: ${message.byteLength}\r\n` +
							"date: this moment\r\n" +
							"server: NElniorS\r\n\r\n"
						);
						socket.write(message);
						socket.end();
					}
					else {
						if (stat.isFile())
							fs.readFile("./mimetypeList.json", function (error, buffer) {
								if (error) {
									let message = Buffer.from(`I have an internal error (533)`, "utf-8");
									socket.write(
										"HTTP/1.1 533 crashed root\r\n" +
										"content-type: text/txt\r\n" +
										`content-length: ${message.byteLength}\r\n` +
										"date: this moment\r\n" +
										"server: NElniorS\r\n\r\n"
									);
									socket.write(message);
									socket.end();
								}
								else {
									const LIST = JSON.parse(buffer.toString("utf-8"));
									let fmt = path.extname(`${direction}${simplify}`);
									let done = false;
									for (let { contyp, format } of LIST) {
										if (fmt.toLowerCase() == format.toLowerCase()) {
											let streamOfFile = fs.createReadStream(`${direction}${simplify}`);
											socket.write(
												"HTTP/1.1 200 Ok\r\n" +
												`content-type: ${contyp}\r\n` +
												`content-length: ${stat.size}\r\n` +
												`date: ${Date.now()}\r\n` +
												"server: NElniorS\r\n\r\n"
											);
											streamOfFile.pipe(socket);
											done = true;
											break;
										}
									}
								}
							});
						else 
							fs.readdir(direction + simplify, function(error, list){
								if (error) {
									let message = Buffer.from(`The "${simplify}" direction is not found.`, "utf-8");
									socket.write(
										"HTTP/1.1 422 crashed root\r\n" +
										"content-type: text/txt\r\n" +
										`content-length: ${message.byteLength}\r\n` +
										"date: this moment\r\n" +
										"server: NElniorS\r\n\r\n"
									);
									socket.write(message);
									socket.end();
								}
								else {
									let data = Buffer.from(JSON.stringify(list), "utf-8");
									socket.write(
										"HTTP/1.1 206 ready\r\n" +
										"content-type: application/json\r\n" +
										`content-length: ${data.byteLength}\r\n` +
										"date: this moment\r\n" +
										"server: NElniorS\r\n\r\n"
									);
									socket.write(data);
									socket.end();
								}
							});
					}
				});
		break;

		case 'post':
			const parsed = DataHandler.parseQueryString(obR.path);
			let simplifyOther = parsed[pathAccess].split("/").filter(el=> el !== "home").join("/");
			
			fs.exists(`${direction}${simplifyOther}`, async function (isAdyacent) {
				if ((isAdyacent && "fileName" in parsed) && "content-length" in obR.headers) {
					// write more data with access key
					if (DataHandler.streamMatriz.has(parsed.accessKey)) {
						let [target, writableStream] = DataHandler.streamMatriz.get(parsed.accessKey);
						try {
							// the first buffer
							let content = Buffer.from(obR.body);
							let status = "continue";
							writableStream.write(content);
							let actualInserted = content.byteLength;

							if (actualInserted == Number(obR.headers["content-length"])) 
								writableStream.writedDataActual += actualInserted;
							else 
								await new Promise((resolve, reject)=> {
									function internalRecurtion () {
										let iterator = moreData.dataCollection[Symbol.iterator]();
										// set more datas
										for (let moreBuffer = iterator.next(); !moreBuffer.done; moreBuffer = iterator.next()) {
											writableStream.write(moreBuffer.value);
											moreData.dataCollection.delete(moreBuffer.value);
											actualInserted += moreBuffer.value.byteLength;
										}
										return actualInserted == Number(obR.headers["content-length"]);
									}
									let interval = setInterval(()=> {
										if (internalRecurtion() || (writableStream.closed || writableStream.destroyed)) {
											clearInterval(interval);
											resolve(writableStream.writedDataActual += actualInserted);
										}
									}, Math.ceil(Math.random()*1000));
								});
							
							if (writableStream.writedDataActual == target) {
								status = "finished";
								writableStream.end();
							}
							socket.write(
								"HTTP/1.1 225 Saved test\r\n" +
								"content-type: text/txt\r\n" +
								`connection: close\r\n` +
								`date: ${Date.now()}\r\n` +
								"server: NElniorS\r\n\r\n"
							);
							socket.write(status);
							moreData.dataCollection.clear();
							socket.end();
							// verbose inserting
						}
						catch (error) {
							let message = `Failed access key. \r\n~ ${error.message}`;
							writableStream.destroy();
							console.log(writableStream.destroyed);
							socket.write(
								"HTTP/1.1 456 Failed\r\n" +
								"content-type: text/txt\r\n" +
								`content-length: ${message.length}\r\n` +
								`date: ${Date.now()}\r\n` +
								"server: NElniorS\r\n\r\n"
							);
							socket.write(message);
							socket.end();
						}
					}
					else {
						try {
							const clientData = Buffer.from(obR.body);
							let bytes = Number(JSON.parse(clientData.toString("utf-8")).bytes);
							if (Number.isNaN(bytes))
								throw new Error(`The file size is not a number.`);
							else if (DataHandler.streamMatriz.size !== 0) {
								for (let [key, value] of DataHandler.streamMatriz) {
									if (path.basename((value[1]).path) == parsed.fileName)
										throw new Error(`The write channel for this file is already in progreess`);
								}
							}

							const writable = fs.createWriteStream(`${direction}${simplifyOther}/${parsed.fileName}`);
							writable["writedDataActual"] = 0;
							let accessKey = generateCode();

							DataHandler.streamMatriz.set(accessKey, [bytes, writable]);

							let error = null, writed = false;

							socket.on("close", ()=> {
								if (!writable.closed) {
									writable.destroy();
									error = new Error("Reset contents");
									fs.unlink(writable.path, function () {});
								}
							});

							writable
							.on("error", errorDetailed=> error = errorDetailed)
							.on("finish", ()=> writed = true
							).on("close", ()=> {
								DataHandler.streamMatriz.delete(accessKey);
								moreData.dataCollection.clear();
								if (error || !writed) 
									return fs.unlink(writable.path, function () {
										let internalInfo = `Failed to load file\r\n~ I don't know`;
										let notifying = `error="${internalInfo}"&`;
										socket.write(`${notifying.length.toString(16)}\r\n`);
										socket.write(`${notifying}\r\n`);
										socket.end(`0\r\n\r\n`);
									});
								let finished = `message="The file is inserted successfully"&`;
								socket.write(`${finished.length.toString(16)}\r\n`);
								socket.write(`${finished}\r\n`);
								socket.end(`0\r\n\r\n`);
							});

							socket.write(
								"HTTP/1.1 224 done\r\n" +
								"content-type: text/plain\r\n" +
								`transfer-encoding: chunked\r\n` +
								`connection: keep-alive\r\n` +
								`date: ${Date.now()}\r\n` +
								"server: NElniorS\r\n\r\n"
							);

							let initialInformation = `accessKey="${accessKey}"&`;
							socket.write(`${initialInformation.length.toString(16)}\r\n`);
							socket.write(`${initialInformation}\r\n`);
						}
						catch (capturedError) {
							let message = Buffer.from(`Failed to "${parsed.fileName}" file insertion into (${parsed[pathAccess]}) direction. \r\n~ ${capturedError.message}`, "utf-8");
							socket.write(
								"HTTP/1.1 436 Failed\r\n" +
								"content-type: text/txt\r\n" +
								`content-length: ${message.byteLength}\r\n` +
								`date: ${Date.now()}\r\n` +
								"server: NElniorS\r\n\r\n"
							);
							socket.write(message);
							socket.end();
						}
					}
				}
				else if ("fileName" in parsed) {
					let message = Buffer.from(`Failed to "${parsed.fileName}" file insertion into (${parsed[pathAccess]}) direction.`, "utf-8");
					socket.write(
						"HTTP/1.1 486 Failed insertion\r\n" +
						"content-type: text/txt\r\n" +
						`content-length: ${message.byteLength}\r\n` +
						"date: this moment\r\n" +
						"server: NElniorS\r\n\r\n"
					);
					socket.write(message);
					socket.end();
				}
				else if (isAdyacent) {
					let dirCreated = Buffer.from(obR.body, "utf-8");
					let condition = /(\w{2,22}\s?)+/;
					let deprecatedSymbols = /[\`\!\¡\#\^\*\(\)\=\"\&\@\:\;\'\,\.\?\/\\\<\>\|\~\%\$]/;
					let val = dirCreated.toString("utf-8");
					let idx = val.indexOf("  ");
					if ((condition.test(val) && idx == -1) && !deprecatedSymbols.test(val))
						fs.mkdir(`${direction}${simplifyOther}/${val}`, function (posibleError) {
							if (posibleError) {
								let message = Buffer.from(`The ${val}/ directory already exists!`, "utf-8");
								socket.write(
									"HTTP/1.1 266 Allright\r\n" +
									"content-type: text/txt\r\n" +
									`content-length: ${message.byteLength}\r\n` +
									"date: this moment\r\n" +
									"server: NElniorS\r\n\r\n"
								);
								socket.write(message);
								socket.end();
							}
							else {
								let message = Buffer.from(`The ${val}/ directory has been created!`, "utf-8");
								socket.write(
									"HTTP/1.1 234 created\r\n" +
									"content-type: text/txt\r\n" +
									`content-length: ${message.byteLength}\r\n` +
									"date: this moment\r\n" +
									"server: NElniorS\r\n\r\n"
								);
								socket.write(message);
								socket.end();
							}
						});
					else {
						let message = Buffer.from(`Invalid directory name, enter better name!`, "utf-8");
						socket.write(
							"HTTP/1.1 477 Invalid Name\r\n" +
							"content-type: text/txt\r\n" +
							`content-length: ${message.byteLength}\r\n` +
							"date: this moment\r\n" +
							"server: NElniorS\r\n\r\n"
						);
						socket.write(message);
						socket.end();
					}
				}
				else {
					let message = Buffer.from(`Error(413): Bad post`, "utf-8");
					socket.write(
						"HTTP/1.1 413 Bad post\r\n" +
						"content-type: text/txt\r\n" +
						`content-length: ${message.byteLength}\r\n` +
						"date: this moment\r\n" +
						"server: NElniorS\r\n\r\n"
					);
					socket.write(message);
					socket.end();
				}
			});
		break;

		default :
			let message = Buffer.from(`The '${obR.method}' HTTP` +
				` method is not supported, please try other.`, "utf-8");
			socket.write(
				"HTTP/1.1 420 bad request\r\n" +
				"content-type: text/txt\r\n" +
				`content-length: ${message.byteLength}\r\n` +
				"date: this moment\r\n" +
				"server: NElniorS\r\n\r\n"
			);
			socket.write(message);
			socket.end();
		break;
	}
}

function handlerSocket (socket) {
	const dataHandler = new DataHandler();
	return socket
	.on("data", data => {
		if (dataHandler.isFirstData) {
			let obRequest = Anully(data);
			dispatch(obRequest, socket, dataHandler);
		}
		else 
			dataHandler.dataCollection.add(data);
		dataHandler.isFirstData = false;
	})
	.on("error", ()=> dataHandler.dataCollection.clear())
	.on("finish", ()=> ("finish"))
	.on("end", ()=> ("end"))
	.on("close", ()=> ("closed"));
}

const SERVER = net.createServer(handlerSocket);

let { stdin, stdout } = process;

stdin.setDefaultEncoding("utf-8");
stdout.setDefaultEncoding("utf-8");

const initialValues = {
	host: '127.30.20.10',
	port: 80
}
stdout.write("_ GEM Control Management System v1.0.0 _\r\n");

stdout.write("Host: ");

let isFirst = true;

function activeServer () {
	return SERVER
	.on("error", errorDetail => console.log("An error has ocurred", errorDetail))
	.listen(initialValues.port, initialValues.host, ()=> console.log(`Run Server... http://${SERVER.address().address}`));
}
stdin
.on("data", function (data) {
	let writed = data.toString("utf-8").replace(/\r|\n/g, "");
	if (isFirst) {
		if (writed == "localhost" || net.isIP(writed) == 4)
			initialValues.host = writed;
		stdout.write("Port: ");
		isFirst = false;
	}
	else {
		if (!Number.isNaN(Number(writed)))
			initialValues.port = Number(writed) > 3? Number(writed) : 80;
		activeServer();
		stdin.removeAllListeners();
	}
});