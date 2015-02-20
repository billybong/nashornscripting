#!/usr/bin/env jjs
/*####################################################################################################################################
# As Nashorn does not have http capabilities through XMLHttpRequest (DOM API), we have to use regular Java classes instead.
# This sample shows how this can be acheived without depending on any third party libraries. Just a standard Java 8 JDK.
# Make sure to have JAVA_HOME/bin on your PATH for the shebang to work. Then just chmod +x away and run...
# Alternatively if you're on a non *nix OS, start with jjs -scritping httpsample.js
####################################################################################################################################*/
var URL = Java.type("java.net.URL");

post();
queryGitHub();
var hasCurl = $EXEC("curl --help").startsWith("Usage:");

function post(){
    httpServer(JSON.stringify({response: "ok", isError: false}));

    var json = {id: 1, someValue: "1234"};
    var data = JSON.stringify(json);
    var contentType = "application/json";
    url = "http://localhost:80";

    var postResponse = httpPost(url, data).data;
    print(JSON.parse(postResponse).response);
}

function queryGitHub(){
    var url = "https://api.github.com/users/billybong/repos";
    var response;

    response = hasCurl ? $EXEC("curl ${url}") : httpGet(url).data;

    var repos = JSON.parse(response);
    print(<<EOD);
    id : ${repos[0].id}
    name : ${repos[0].name}
    full name : ${repos[0].full_name}
    owner : ${repos[0].owner.login}
    EOD
}

/*************
UTILITY FUNCTIONS
*************/

function httpGet(theUrl){
    var con = new URL(theUrl).openConnection();
    con.requestMethod = "GET";

    return asResponse(con);
}

function httpPost(theUrl, data, contentType){
    contentType = contentType || "application/json";

    if(hasCurl){
        return curlPost(theUrl, data, contentType);
    }

    var con = new URL(theUrl).openConnection();

    con.requestMethod = "POST";
    con.setRequestProperty("Content-Type", contentType);

    // Send post request
    con.doOutput=true;
    write(con.outputStream, data);

    return asResponse(con);
}

function asResponse(con){
    var d = read(con.inputStream);

    return {data : d, statusCode : con.responseCode};
}

function write(outputStream, data){
    var wr = new java.io.DataOutputStream(outputStream);
    wr.writeBytes(data);
    wr.flush();
    wr.close();
}

function read(inputStream){
    var inReader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream));
    var inputLine;
    var response = new java.lang.StringBuffer();

    while ((inputLine = inReader.readLine()) != null) {
           response.append(inputLine);
    }
    inReader.close();
    return response.toString();
}

/**
* Create a mock http server on port 80
*/
function httpServer(response){
    var HttpServer = Java.type("com.sun.net.httpserver.HttpServer");
    var InetSocketAddress = Java.type("java.net.InetSocketAddress");

    var server = HttpServer.create(new InetSocketAddress(80), 0);

    server.createContext("/", function(exchange){
        var input = read(exchange.requestBody);
        print("Http server received request: " + input);
        var os = exchange.getResponseBody();
        exchange.responseHeaders.set("Content-Type", "text/html; charset=utf-8");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        write(os, response);
    });
    server.setExecutor(null);
    server.start();
    print("started http server");
}

function curlPost(theUrl, data, contentType){
    var File = Java.type("java.io.File");
    var Files = Java.type("java.nio.file.Files");

    var file = new File("request.json");
    Files.write(file.toPath(), data.bytes);
    var command = "curl -v -H \"Content-Type: application/json\" \"${url}\" -d @${file.name}";
    print(command);

    $EXEC(command);
    var response = $OUT;
    file.delete();

    return {data:response, statusCode: 200};
}