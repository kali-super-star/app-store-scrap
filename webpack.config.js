const path = require('path');

   module.exports = {
     entry: {
      background: './src/background.js',
      detailpage: './src/detailpage.js',
      popup: './src/popup.js',
      scrap: './src/scrap.js',
      start: './src/start.js',
     },
     output: {
       path: path.resolve(__dirname, 'dist'),
     },
   };