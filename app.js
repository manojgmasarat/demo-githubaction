const { log } = require("console");
const express = require("express");
const https = require("https");
const querystring = require("querystring");

const app = express();
const port = 3000; // You can choose any available port

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
//   1. Prepare the checkout
app.get("/checkouts", async (req, res) => {
  const data = querystring.stringify({
    entityId: "8ac7a4ca8d7b587f018d7e3995db04cb", //our entitiyId
    amount: "100.00",
    currency: "SAR",
    paymentType: "PA",
    createRegistration: false, //here I am passing true
  });

  const cardRegistationStatus = {
    port: 443,
    host: "eu-test.oppwa.com",
    path: "/v1/checkouts",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length,
      Authorization:
        "Bearer OGFjN2E0Y2E4YzMxYzBlZjAxOGMzNDYyY2E3NTAzOTV8cVliNUd0eUgyellGajI1bg==",
    },
  };

  try {
    const result = await makeRequest(cardRegistationStatus, data);
    console.log({ result });
    res.json(result);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
});

const makeRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const postRequest = https.request(options, function (res) {
      const buf = [];
      res.on("data", (chunk) => {
        buf.push(Buffer.from(chunk));
      });
      res.on("end", () => {
        const jsonString = Buffer.concat(buf).toString("utf8");
        try {
          resolve(JSON.parse(jsonString));
        } catch (error) {
          reject(error);
        }
      });
    });
    postRequest.on("error", reject);
    postRequest.write(data);
    postRequest.end();
  });
};
//3. Get the payment status
app.get("/GetPaymentStatus/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log(id);
    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }
    const result = await getPaymentStatus(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getPaymentStatus = (id) => {
  const fullPath = `/v1/checkouts/${id}/payment?entityId=8ac7a4ca8d7b587f018d7e3995db04cb`;

  const options = {
    port: 443,
    host: "eu-test.oppwa.com",
    path: fullPath,
    method: "GET",
    headers: {
      Authorization:
        "Bearer OGFjN2E0Y2E4YzMxYzBlZjAxOGMzNDYyY2E3NTAzOTV8cVliNUd0eUgyellGajI1bg==",
    },
  };

  return new Promise((resolve, reject) => {
    const postRequest = https.request(options, (response) => {
      const buf = [];

      response.on("data", (chunk) => {
        buf.push(Buffer.from(chunk));
      });

      response.on("end", () => {
        const jsonString = Buffer.concat(buf).toString("utf8");
        try {
          resolve(JSON.parse(jsonString));
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    });

    postRequest.on("error", reject);
    postRequest.end();
  });
};

//3. Get the registration status
app.get("/GetRegistrationStatus/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }
    const result = await getRegistrationStatus(id);
    console.log(result);
    res.json({ result });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getRegistrationStatus = (id) => {
  // const path = `/v1/checkouts/${id}/registration?entityId=8ac7a4ca8d7b587f018d7e3995db04cb`;
  // const fullPath = path + "?entityId=8ac7a4ca8d7b587f018d7e3995db04cb"; //change it

  // const options = {
  //   port: 443,
  //   host: "eu-test.oppwa.com",
  //   path: path,
  //   method: "GET",
  //   headers: {
  //     Authorization:
  //       "Bearer OGFjN2E0Y2E4YzMxYzBlZjAxOGMzNDYyY2E3NTAzOTV8cVliNUd0eUgyellGajI1bg==", // change it
  //   },
  // };
  var path = "/v1/checkouts/" + id + "/registration";
  path += "?entityId=8ac7a4ca8d7b587f018d7e3995db04cb";
  const options = {
    port: 443,
    host: "eu-test.oppwa.com",
    path: path,
    method: "GET",
    headers: {
      Authorization:
        "Bearer OGFjN2E0Y2E4YzMxYzBlZjAxOGMzNDYyY2E3NTAzOTV8cVliNUd0eUgyellGajI1bg==",
    },
  };
  return new Promise((resolve, reject) => {
    const postRequest = https.request(options, (response) => {
      const buf = [];

      response.on("data", (chunk) => {
        buf.push(Buffer.from(chunk));
      });

      response.on("end", () => {
        const jsonString = Buffer.concat(buf).toString("utf8");
        try {
          console.log({ paymentStatus: JSON.parse(jsonString) });
          resolve(JSON.parse(jsonString));
        } catch (error) {
          reject(error);
        }
      });
    });

    postRequest.on("error", reject);
    postRequest.end();
  });
};
//4. Send payment using the token
app.get("/registrationsPayments/:id", async (req, res) => {
  const id = req.params.id;
  const path = `/v1/registrations/${id}/payments`;
  const data = querystring.stringify({
    entityId: "8ac7a4ca8d7b587f018d7e3995db04cb", //our entitiyId
    paymentBrand: "VISA",
    paymentType: "DB",
    amount: "17.99",
    currency: "EUR",
    "standingInstruction.type": "UNSCHEDULED",
    "standingInstruction.mode": "INITIAL",
    "standingInstruction.source": "CIT",
    testMode: "EXTERNAL",
    // 'createRegistration':"true"//here I am passing true
  });

  const options = {
    port: 443,
    host: "eu-test.oppwa.com",
    path: path,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length,
      Authorization:
        "Bearer OGFjN2E0Y2E4YzMxYzBlZjAxOGMzNDYyY2E3NTAzOTV8cVliNUd0eUgyellGajI1bg==",
    },
  };

  try {
    const result = await makeRequest(options, data);
    res.json(result);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});               