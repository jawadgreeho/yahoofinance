const express = require('express');
const csv = require('csv-parser')
const fs = require('fs');
const yahooFinance = require('yahoo-finance');

const app = express();

app.use(express.json())

app.listen(3001, ()=>{
    console.log('server running on port 3001');
});

const results = [] 
const companies = []
const headers = []
const output = [{}, {}, {}, {}, {}]
const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };

const getCompanies = (results) => {
    for(let i = 0; i < results.length; i++){
     companies.push(results[i].company) 
    }
    console.log("printing companies", companies);
    
    createHeader()
 }


fs.createReadStream('companies.csv')
    .pipe(csv(['company', 'origin']))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        // console.log(results);
        getCompanies(results); 
    })

    

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
                        output[i]['Date'] = value?.[i]?.date.toISOString()
                    }
                    console.log(`${key}: ${value?.[i]?.close.toFixed(3) ?? ""} ${value?.[i]?.date ?? ""}`);
                    output[i][value?.[i]?.symbol] = value?.[i]?.close?.toFixed(3)
                }
                j = false
                console.log("output", output);
              }
        // console.log(result.'583.SI'[0].close);
        console.log("printing output", output);
        }
        catch(err){
            console.log(err);
        }
    }

    
    const createHeader = () => {
        headers.push({id: 'Date', title: 'Date'})
        for (let i = 0; i < companies.length; i++){
            headers.push({id: companies[i], title: companies[i]})
            console.log("headers", headers);
        }
    }

    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'output.csv',
        header: headers
    });
    
    
    

    

    setTimeout(function(){ getData() }, 1000);
    setTimeout(function(){ csvWriter.writeRecords(output)       // returns a promise
        .then(() => {
            console.log('...Done');
        }); }, 15000);

    
// yahooFinance.historical({
//     symbols: ['AAPL', 'GOOGL', '9E8.F',],
//     from: '2012-01-01',
//     to: '2012-01-10',
//     period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
// }, function (err, result) {
//     if (err) { console.log(err); }
//     console.log(result);
//   });