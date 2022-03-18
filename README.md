# IT5007 Tutorial-3: Read Me Instructions

Github repo URL: https://github.com/aar809/it5007_tut4

Prepared by: Aaron Lok Hin Chan (A0117352M)

## Purpose:
The Train Ticket Booking System website allows an easy way for customer-facing staff at Singapore High-Speed Intercontinental Railway to book train tickets for passengers at the front-desk or over the phone.

## Instructions:
To execute the website, user will need to download the zip file into local docker folder, open the terminal to the main project folder, and run the following commands:
-  `npm install`
-  `npm install --save-dev @babel/core@7 @babel/cli@7`
-  `node_modules/.bin/babel --version`
-  `npm install --save-dev @babel/preset-react@7`
-  `npx babel src --presets @babel/react --out-dir public`
-  `mongod`
-  `npm run watch`
-	Then open a second terminal, and run `npm start`
-   Run `mongo issuetracker scripts/init.mongo.js` to initialize the database and test out the CRUD operations via standalone script.

The user should be able to access the website, where they can help travellers to book tickets, delete tickets, display ticket information in a lis, and add any troublemakers to the 'blacklist', where they can't book a ticket anymore.
