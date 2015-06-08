# Sensing Evolution

## Developer

### Setup

Assuming that `npm` is installed:

    npm install

    bower install

### Building via phonegap cloud build

    grunt cloudbuild:<authToken>

Your auth token can be found on the 'Client Applications' panel of Phonegap's 'Edit Account' page


### Importing data

The data for the app comes from the spreadsheet SensingEvolutionData.xlsx.

This sheet should be exported to .csv into a folder named SensingEvolutionData.

>Note: When importing the xlsx into Numbers, some extra empty columns and rows are generated on the smaller tables.

>It's necessary to either remove these rows, or else clean up the exported csv. OpenOffice doesn't suffer from this problem, but can only export one sheet at a time.



The following task then converts the data to the json format read by the app

    grunt convertData


### Testing

Tests are configured using jasmine.

Add spec files to test/specs/*Specs.js and can be run in the PhantomJS headless browser with the following Grunt task:

    grunt test
    
