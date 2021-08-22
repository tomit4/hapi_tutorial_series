'use strict'

const Hapi = require('@hapi/hapi')
const Inert = require("@hapi/inert")
const path = require("path")
const Connection = require("./db_config")
const Users = require("./models/users")
// const Boom = require("@hapi/boom")

const users = {
    WittCode: {
        username: 'WittCode',
        password: 'soccer',
        id: 0,
        name: 'Witt Code'
    },
    Greg: {
        username: 'Greg',
        password: '1234',
        id: 1,
        name: 'Gregory'
    }
}

const validate = async (request, username, password, h) => {

    if (!users[username]) {
        return {
            isValid: false
        }
    }

    const user = users[username]

    if (user.password === password) {
        return {
            isValid: true,
            credentials: {
                id: user.id,
                name: user.name
            }
        }
    }
}


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
        },
        // {
        //     plugin: require('@hapi/basic') // basic login support...kind of large and ugly, I don't know...
        // }
        {
            plugin: require('@hapi/cookie')
        }
    ])


    server.auth.strategy('login', 'cookie', {
        cookie: {
            name: 'soccer',
            password: 'soccersoccersoccersoccersoccersoccersoccersoccersoccer',
            isSecure: false,
            ttl: 30000 // time to live, sets an expiration time for the cookie
        },
        redirectTo: '/login',
        validateFunc: async (request, session) => {
            if (session.username === 'WittCode', session.password === 'subscribe') {
                return {
                    valid: true,
                    credentials: {
                        username: 'soccer'
                    }
                }
            } else {
                return {
                    valid: false
                }
            }
        }
    })

    // Create a Scheme(overall authentication) with a Strategy (implementation of that authentication using @hapi/basic

    // server.auth.strategy('login', 'basic', {
    //     validate
    // })

    server.auth.default('login')


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
                if (request.auth.isAuthenticated) { // if we've already authenticated with a session cookie...
                    return h.redirect('/welcome') // just bring them back to their welcome page
                }
                return h.file('./welcome.html') // and here we serve a static file, just like in our express todo app
            },
            options: {
                auth: {
                    mode: 'try' // allows user to access without a cookie being present, opposite of this is required, which is set by default
                }
            }

        },
        {
            method: 'GET',
            path: '/getUsers',
            handler: async (request, h) => {
                const dbConnection = await Connection.connect

                return h.view('index', {
                    users
                })
            }
        },
        // {
        //     method: 'GET',
        //     path: '/loginBasic',
        //     handler: (request, h) => {
        //         const name = request.auth.credentials.name
        //         return `Welcome ${name} to my restricted page!`
        //     },
        //     options: {
        //         auth: 'login' // refers to our authorization strategy name defined above
        //     }
        // },
        // {
        //     method: 'GET',
        //     path: '/logoutBasic',
        //     handler: (request, h) => {
        //         return Boom.unauthorized("You have ben logged out successfully!") // uses Boom, but I think is depredated, works, brings us to 404, but it should also log us out, which it does NOT
        //     }
        // },
        {
            method: 'POST',
            path: '/login',
            handler: (request, h) => {
                // Users.createUser(request.payload.username, request.payload.password)
                // return h.view('index', {
                //     username: request.payload.username
                // })

                if (request.payload.username === 'WittCode' && request.payload.password === 'subscribe') {
                    request.cookieAuth.set({
                        // likesSports: true, // this is normal for advertising purposes
                        username: request.payload.username, // but we're just going to save their credentials to the browser's cookies
                        password: request.payload.password
                    })
                    return h.redirect('/welcome')
                } else {
                    return h.redirect('/')
                }

            },
            options: {
                auth: {
                    mode: 'try'
                }
            }
        },
        {
            method: 'GET',
            path: '/logout',
            handler: (request, h) => {
                request.cookieAuth.clear()
                return h.redirect('/')
            }
        },
        {
            method: 'GET',
            path: '/welcome',
            handler: (request, h) => {
                return `Hello ${request.auth.credentials.username}`
            }
        },
        // Handling 404 error
        {
            method: 'GET',
            path: '/{any*}',
            handler: (request, h) => {
                return "<h1>Oh No! You must be lost ...</h1>"
            },
            options: {
                auth: {
                    mode: 'try'
                }
            }
        },
    ])

    await server.start()
    console.log(`Server started on: ${server.info.uri}`)

}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()