const express = require('express');
const csv = require('csv-parser')
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const yahooFinance = require('yahoo-finance');

const app = express();

app.use(express.json())

app.listen(3001, ()=>{
    console.log('server running on port 3001');
});

const pipeline = util.promisify(stream.pipeline);

const results = [] 
const companies = []
const headers = []
const output = []

const getCompanies = async() => {
    for(let i = 0; i < results.length; i++){
     companies.push(results[i].company) 
    }
    console.log("printing companies", companies);
    return companies
}


const getData = async() => {
    try{
        const result = await yahooFinance.historical({
            symbols: companies,
            from: '2012-01-01',
            to: '2012-01-10',
            period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
        })

        console.log(result);
        let j = true
        for (const [key, value] of Object.entries(result)) {
            for(let i = 0; i < value.length; i++){
                if(j) {
                    output.push({Date: value?.[i]?.date.toISOString()})
                }
                console.log(`${key}: ${value?.[i]?.close.toFixed(3) ?? ""} ${value?.[i]?.date ?? ""}`);
                output[i][value?.[i]?.symbol] = value?.[i]?.close?.toFixed(3)
            }
            j = false
            console.log("output", output);
            }
    console.log("printing output", output);
    return output
    }
    catch(err){
        console.log(err);
    }
}

    
const createHeader = async() => {
    headers.push({id: 'Date', title: 'Date'})
    for (let i = 0; i < companies.length; i++){
        headers.push({id: companies[i], title: companies[i]})
        console.log("headers", headers);
    }
    return headers;
}

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'output1.csv',
    header: headers
});
  
async function run() {
            try{
                fs.createReadStream('companies.csv')
                .pipe(csv(['company', 'origin']))
                .on('data', (data) => results.push(data))
                .on('end', async() => {
                    await getCompanies()
                    await createHeader()
                    await getData()
                    csvWriter.writeRecords(output)
                    console.log('Pipeline succeeded');
                })
            }catch(error){
                console.log(error);
            }
    }

run()