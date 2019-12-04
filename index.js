#!/usr/bin/env node

const opn = require("opn")
const { exec } = require("child_process")

console.log("Installing the Tailwind preset...")

exec("composer require laravel-frontend-presets/tailwindcss --dev", (err, stdout, stderr) => {
    if (err) {
        console.log("Could not install the preset")
        return
    }

    exec("php artisan preset tailwindcss", (err, stdout, stderr) => {
        if (err) {
            console.log("Could not use the preset")
            return
        }

        console.log("Installing NPM dependencies...")

        exec("npm install && npm run dev", (err, stdout, stderr) => {
            if (err) {
                console.log("Could not install NPM dependencies")
                return
            }

            exec("composer remove laravel-frontend-presets/tailwindcss", (err, stdout, stderr) => {
                if (err) {
                    console.log("Could not uninstall the preset")
                    return
                }

                opn("https://tailwindcss.com", {
                    wait: false,
                })

                console.log("Done.")
            })
        })
    })
})
