const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
const Airtable = require('airtable')
const minify = require('html-minifier').minify

const base = new Airtable({apiKey: 'keyjNAb6PHldLgsxZ'}).base('appiaOTA1oFPWTrDr')

// Store results here
let results = []

base('Pubs')
.select({
  sort: [{field: 'Area', direction: 'asc'}]
})
.eachPage(
  function page(records, fetchNextPage) {
    records.forEach(record => {
      let pub = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(record.fields['lng']),
            parseFloat(record.fields['lat'])
          ]
        },
        properties: Object.assign(record.fields, { _id: record.id })
      }

      results.push(pub)
    })

    fetchNextPage()
  },
  function done(err) {
    if (err) throw err

    let pubs = {
      type: "FeatureCollection",
      features: results
    }

    ejs.renderFile('./index.ejs', { pubs }, (err, output) => {
      if (err) throw err

      let html = minify(output, {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeAttributeQuotes: true
      })

      fs.writeFile('./index.html', html, (err) => {
        if (err) throw err

        console.log('Render complete!')
      }) 
    })
  }
)