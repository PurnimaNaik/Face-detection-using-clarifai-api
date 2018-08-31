 var path=require("path");

 var DIST_DIR=path.resolve(__dirname, "dist");
 var SRC_DIR=path.resolve(__dirname, "src");

 var config={
   entry:{
     index: SRC_DIR + "/app/index.js",
   },
   performance: {
     hints: false
   },
   mode: "production",

   output: {
     path:DIST_DIR + "/app",
     filename:"bundle.js",
     publicPath: "/app",
   },

   module:{
     rules: [
       {
         test:/\.js?/,
         include:SRC_DIR,
         loader: "babel-loader",
         query:{
           presets:["react", "es2015", "stage-2"]
         }},
         {
           test: /\.css$/,
           use: [ 'style-loader', 'css-loader' ]
         },
         {
     test: /\.(png|jpg|gif)$/,
     use: [
       {
         loader: 'url-loader',
         options: {
           limit: 8192
         }
       }
     ]
   },
   {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
     ]
   }
 };

 module.exports=config;
