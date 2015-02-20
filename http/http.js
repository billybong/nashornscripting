/*************
UTILITY FUNCTIONS
*************/
function http() {
    function send(url, data, contentType, method) {
        contentType = contentType || "application/json";
            var con = new java.net.URL(theUrl).openConnection();

            con.requestMethod = method;
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

        while ((inputLine = inReader.readLine()) !== null) {
            response.append(inputLine);
        }
        inReader.close();
        return response.toString();
    }

    return {
        get: function(url){
            var con = new java.net.URL(url).openConnection();
            con.requestMethod = "GET";
            return asResponse(con);
        },
        post: function(url, data, contentType){
            return send(url, data, contentType, 'POST');
        },
        put: function(url, data, contentType){
            return send(url, data, contentType, 'PUT');
        },
        delete: function(url){
            var con = new java.net.URL(url).openConnection();
            con.requestMethod = "DELETE";
            return asResponse(con);
        }
    };
}