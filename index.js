const http = require("http");
const path = require("path");
const fs = require("fs/promises");
const { ok } = require("assert");

const PORT = 8001;

const app = http.createServer(async (request, response) => {
  const method = request.method;
  console.log(method);
  const url = request.url;

  if (url === "/tasks") {
    const jsonPath = path.resolve("./data.json");
    const jsonFile = await fs.readFile(jsonPath, "utf8");

    if (method === "GET") {
      response.setHeader("Content-Type", "application/json");
      response.writeHead("200");
      response.write(jsonFile);
    }
    if (method === "POST") {
      
      request.on("data", async (data) => {
        const newTask = JSON.parse(data);
        const arr = JSON.parse(jsonFile);
        arr.push({ id: getID(arr), ...newTask });

        await fs.writeFile(jsonPath, JSON.stringify(arr), (error) => {
          if (error) console.log(error);
        });
      });
      response.writeHead(201, {
        status: "ok",
        "Content-Type": "application/json",
      });
    }
    if (method === "PUT") {
      
      request.on("data", async (data) => {
        const {id,status} = JSON.parse(data);
        const arr = JSON.parse(jsonFile);

        const idIndex = arr.findIndex( task => task.id === id);
        arr[idIndex].status = status;

        await fs.writeFile(jsonPath, JSON.stringify(arr), (error) => {
          if (error) console.log(error);
        });                
      });
      response.writeHead(201, {
        status: "ok",
        "Content-Type": "application/json",
      });
    }
    if( method === 'DELETE'){          
      request.on('data', async (data) => {
          
        const {id}= JSON.parse(data);
        const arr = JSON.parse(jsonFile);
       
        const idIndex = arr.findIndex( task => task.id === id);
        console.log(idIndex); 
        if(idIndex >= 0){
          arr.splice(idIndex,1);
        }
        await fs.writeFile(jsonPath, JSON.stringify(arr), (error) => {if(error) console.log(error)});
                
      });
      response.setHeader("Content-Type", "application/json");
      response.writeHead("200");
      
    }
  } else {
    response.writeHead("503");
  }

  response.end();
});

app.listen(PORT);

const getID = (arr) => {
  if (arr.length > 0){
    const lastID = arr[arr.length - 1].id;
    return (newID = lastID + 1);
  }else {
    return 1
  }
};

console.log("servidor corriendo");

/*
  POST
  {
    "title":"comer",
    "description":"comer mucho",
    "status": false
  }
  PUT
  {
    "id": 2,
    "status": false
  }
  DELETE
  {
  "id": 2
  }
*/