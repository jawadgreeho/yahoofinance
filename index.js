const express = require('express');
const csv = require('csv-parser')
const fs = require('fs');
// const util = require('util');
// const stream = require('stream');
const yahooFinance = require('yahoo-finance');

const app = express();

const results = [] 
const companies = []
const headers = []
const output = []


//VALIDATION MIDDLEWARE CHECKS WHETHER REQ COMES FROM AUTHORIZED ORIGIN 
const validation = async(req, res, next) => {
    const origin = req.get('origin');
    console.log("origin", origin);
    let { symbol } = req.query;
    console.log("symbol", symbol);
    const allowed = await domains(symbol)
    console.log("allowed", allowed);
    if(allowed.includes(origin)) {
        console.log("origin", origin);
        next()
    }
    else {
        console.log("");
        res.status(403).json({ message: "Forbidden" });
    }
}

//RETURNS THE AUTHORIZED ORIGIN(s) FOR A SPECIFIC URL ENDPOINT
const domains = (symbol) => {
    console.log("sym", symbol);
    let temp = ""
    results.forEach(function (arrayItem) {
        if(arrayItem.company === symbol){
            temp = arrayItem.origin
        }
    });
    return temp.split(',');
}
//USE VALIDATION MIDDLEWARE FOR ALL GET REQ
app.use(validation)

app.listen(3001, ()=>{
    console.log('server running on port 3001');
});

//TASK 2
//RETURNS THE CLOSING PRICE OF GIVEN SYMBOL FROM STARTDATE TO ENDDATE
app.get('/company', (req, res)=>{
    let { symbol, startDate, endDate } = req.query;
    const startToDate = new Intl.DateTimeFormat("en-us", { day: "2-digit" }).format(new Date(startDate))
    const endToDate = new Intl.DateTimeFormat("en-us", { day: "2-digit" }).format(new Date(endDate))
    let closingPrice = []
    output.forEach(function (arrayItem) {
        console.log("arrayItem", arrayItem);
        let tempObj = {}
        const dateToCompare = new Intl.DateTimeFormat("en-us", { day: "2-digit" }).format(new Date(arrayItem.Date))
        if(dateToCompare >= startToDate && dateToCompare <= endToDate){
            tempObj.date = arrayItem.Date;
            tempObj.close = arrayItem[symbol];
            tempObj.symbol = symbol;

            closingPrice.push(tempObj)
        }
    });
        
    console.log(closingPrice);
    res.status(200).json(closingPrice)
})


const getCompanies = async() => {
    for(let i = 0; i < results.length; i++){
     companies.push(results[i].company) 
    }
    return companies
}

//FETCH CLOSING PRICE FROM YAHOO FINANCE FOR GIVEN TICKERS
const getData = async() => {
    try{
        const result = await yahooFinance.historical({
            symbols: companies,
            from: '2012-01-01',
            to: '2012-01-10',
            period: 'd'
        })

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
            }
    return output
    }
    catch(err){
        console.log(err);
    }
}

//RETURN     
const createHeader = async() => {
    headers.push({id: 'Date', title: 'Date'})
    for (let i = 0; i < companies.length; i++){
        headers.push({id: companies[i], title: companies[i]})
    }
    return headers;
}

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'output1.csv',
    header: headers
});
  
//INITIALIZE APP
//TASK 1
const run = async() => {
    try{
        fs.createReadStream('companies.csv')
        .pipe(csv(['company', 'origin']))
        .on('data', (data) => results.push(data))
        .on('end', async() => {
            console.log("r:", results);
            await getCompanies()
            await createHeader()
            await getData()
            csvWriter.writeRecords(output)
            console.log("output", output);
            console.log('Written to file successfully');
        })
    }catch(error){
        console.log(error);
    }
}

run()

