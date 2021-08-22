// server.js prior to sequelize models tutorial (video # 8), notes got too messy, but didn't want to delete created server2.js to run with cleaner slate.

'use strict'

const Hapi = require('@hapi/hapi')
const Inert = require("@hapi/inert")
const path = require("path")
const Connection = require("./db_config")

const init = async () => {

    const server = Hapi.server({
        host: 'localhost',
        port: 1234,
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'static')
            }
        }
    })


    //register hapi plugins syntax, note that we don't HAVE TO require() the hapi plugin above, but rather below,
    //Note that we didn't HAVE TO DO THIS, we could require it above in the global scope as well
    // we did install it using npm
    await server.register([{
            plugin: require("hapi-geo-locate"), // allows you to locate requests by ip address
            options: {
                enabledByDefault: true
            }
        },
        {
            plugin: Inert // this is what allows us to use h.file below, a very powerful feature
        },
        {
            plugin: require("@hapi/vision") // allows the use of middleware...docs say it is template rendering support
        }
    ])

    // Installing Non-Hapi Middleware/Template Engines using @hapi/vision

    server.views({
        engines: {
            hbs: require('handlebars')
        },
        path: path.join(__dirname, 'views'), // this will basically point any html files within our views folder to be allowed to utilize the handlebars templating engine
        layout: 'default' // refers to our default.hbs file, it will dynamically keep whatever is rendered here on every page, this is due to the layout key...doesn't quite work
    })


    server.route([{
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.file('./welcome.html') // and here we serve a static file, just like in our express todo app
            },

            // This routes all our files to this specific 'static' folder, but ONLY for this particular GET request option, it would not, for example, be able to do so below in our other request objects, UNLESS we use it more "globally" within our server object under the routes: key.            
            // options: {
            //     files: {
            //         relativeTo: path.join(__dirname, 'static') // very similar to express, also uses nodeJS native path module
            //     }
            // }
        },
        // {
        //     method: 'GET',
        //     path: '/dynamic',
        //     handler: (request, h) => {
        //         const data = {
        //             name: 'Brian'
        //         }
        //         return h.view('index', data) // uses the @hapi/vision template renderer to use handlebars middleware, which then renders whatever is in the data.name key in the {{ name }} field in our views/index.html file, in this case "WittCode"
        //     }
        // },
        {
            method: 'POST',
            path: '/login',
            handler: (request, h) => {
                // if (request.payload.username === 'WittCode' && request.payload.password === "1234") {
                //     return h.file('logged_in.html')
                // } else {
                //     return h.redirect('/')
                // }

                return h.view('index', {
                    username: request.payload.username
                })

            }
        },
        // {
        //     method: 'GET',
        //     path: '/download',
        //     handler: (request, h) => {
        //         return h.file('./welcome.html', {
        //             mode: 'attachment', // this is what allows us to actually download whatever we pass it, in this case we pass it the welcome-download.html file, which is the welcome.html file itself, just renamed... keep in mind that the filename isn't what it is referencing, it is what the file is RENAMED as.
        //             filename: 'welcome-download.html'
        //         })
        //     }
        // },
        // {
        //     method: 'GET',
        //     path: '/location',
        //     handler: (request, h) => {
        //         if (request.location) {
        //             return h.view('location', {
        //                 location: request.location.ip
        //             })
        //         } else {
        //             return h.view('location', {
        //                 location: "Your location is not enabled"
        //             })
        //         }

        //     }
        // },
        // {
        //     method: 'GET',
        //     path: '/users/{user?}', // the question mark at the END makes that parameter OPTIONAL, the user doesn't have to enter it
        //     handler: (request, h) => {
        //         return "<h1>Users Page</h1>"
        //         // return `<h1>Hello ${request.params.user}</h1>`
        //         // if (request.params.user) {
        //         //     return `<h1>Hello ${request.params.user}</h1>`
        //         // } else {
        //         //     return `<h1>Hello Stranger!</h1>` 
        //         // }
        //         // return `<h1>${request.query.name}</h1>` //entered as localhost:1234/users/?name=brian
        //         // return `<h1>${request.query.name} ${request.query.lastname}</h1>` //entered as localhost:1234/users/?name=brian&lastname=hayes

        //         // return h.redirect('/') // much like res.redirect() in ExpressJS

        //     }
        // },
        // Handling 404 error
        {
            method: 'GET',
            path: '/{any*}',
            handler: (request, h) => {
                return "<h1>Oh No! You must be lost ...</h1>"
            }
        }
    ])

    await server.start()
    console.log(`Server started on: ${server.info.uri}`)

}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()