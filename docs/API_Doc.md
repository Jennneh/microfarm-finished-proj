# MICROFARMS API

The API to the Microfarm Management System is described below.

## Get list of Things

### Request

`GET /example/`

    curl -i -H 'Accept: application/json' http://localhost:8001/api/example/

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 64
    ETag: W/"40-xT/b5Gz3mddbgmmKF3LKDGAODtA"
    Date: Tue, 26 May 2020 10:07:18 GMT
    Connection: keep-alive

    {"API Example Status":[{"Requested":"True","Responded":"True"}]}

