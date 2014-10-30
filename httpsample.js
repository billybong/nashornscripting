#!/usr/bin/env jjs
/*####################################################################################################################################
# As Nashorn does not have http capabilities through XMLHttpRequest (DOM API), we have to use regular Java classes instead.
# This sample shows how this can be acheived without depending on any third party libraries. Just a standard Java 8 JDK.
# Make sure to have JAVA_HOME/bin on your PATH for the shebang to work. Then just chmod +x away and run...
# Alternatively if you're on a non *nix OS, start with jjs -scritping httpsample.js
#
####################################################################################################################################*/
var url = "https://api.github.com/users/billybong/repos";
var response;

if(`curl --help`.startsWith("Usage:")){
    //curl variant, preferable for *nix
    print("using curl...");
    response = $EXEC("curl ${url}");
}else{
    //naive java implementation variant, if curl is not available
    print("using native");
    response = httpGet("https://api.github.com/users/billybong/repos").data;
}

var repos = JSON.parse(response);
print(<<EOD);
id : ${repos[0].id}
name : ${repos[0].name}
full name : ${repos[0].full_name}
owner : ${repos[0].owner.login}
EOD

var json = {id: 1, someValue: "1234"};
httpPost("http://postcatcher.in/catchers/5452274a3a57d0020000086b", JSON.stringify(json));

/*************
UTILITY FUNCTIONS
*************/

function httpGet(theUrl){
    var con = new java.net.URL(theUrl).openConnection();
    con.requestMethod = "GET";

    return asResponse(con);
}

function httpPost(theUrl, data, contentType){
    contentType = contentType || "application/json";
    var con = new java.net.URL(theUrl).openConnection();

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