const express = require('express');
const bodyParser = require('body-parser');
const requests = require('requests');
const { urlencoded } = require('body-parser');
const https = require('https');
require('dotenv').config({path: __dirname + '/.env'});

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let constructUrl = (audienceId) => {
    let url = "https://us20.api.mailchimp.com/3.0/lists/" + audienceId;
    return url;
};

let getAudienceId = () => {
    return process.env.AudienceID;
};
let getAPIKey = () => {
    return process.env.APIKey;
};

let makeRequest = (jsonData,res) => {
    const url = constructUrl(getAudienceId());
    const options = {
        method: 'POST',
        auth: getAPIKey()
    };
    const request = https.request(url, options, (response) => {
        if(response.statusCode === 200) {
            res.sendFile(__dirname + '/success.html');
        }
        else {
            res.sendFile(__dirname + "/failure.html");
        }
        response.on('data', (data) => {
            let parsedData = JSON.parse(data);
            console.log(parsedData);
        });
    }); 
    request.write(jsonData);
    request.end();
};

app.get('/', (req,res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post('/', (req,res) => {
    let firstName = req.body.fName;
    let lastName = req.body.lName;
    let email = req.body.email;
    let data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };
    let jsonData = JSON.stringify(data);
    makeRequest(jsonData,res);
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});