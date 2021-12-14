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

const getCompanies = (results) => {
    for(let i = 0; i < results.length; i++){
     companies.push(results[i].company) 
    }
    console.log("printing companies", companies);
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

            for (const [key, value] of Object.entries(result)) {
                for(let i = 0; i < value.length; i++)
                console.log(`${key}: ${value?.[i]?.close ?? ""} ${value?.[i]?.date ?? ""}`);
              }

        // console.log(result.'583.SI'[0].close);
        }
        catch(err){
            console.log(err);
        }
    }

    

    setTimeout(function(){ getData() }, 1000);

    
// yahooFinance.historical({
//     symbols: ['AAPL', 'GOOGL', '9E8.F',],
//     from: '2012-01-01',
//     to: '2012-01-10',
//     period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
// }, function (err, result) {
//     if (err) { console.log(err); }
//     console.log(result);
//   });