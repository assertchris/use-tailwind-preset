#!/usr/bin/env node

import { exec } from "child_process"
import React, { Component } from "react"
import { render, Box, Color } from "ink"
import SelectInput from "ink-select-input"

const DEBUG = process.env.DEBUG

const WAIT = async () => new Promise(resolve => setTimeout(resolve, 1000))

const promiseFromExec = async command =>
    new Promise(function(resolve, reject) {
        exec(command, function(err, stdout, stderr) {
            if (err) {
                return reject(err)
            }

            resolve(stderr, stdout)
        })
    })

const commands = {
    "npm": {
        "install": async () => (DEBUG ? WAIT() : promiseFromExec("npm install")),
        "build": async () => (DEBUG ? WAIT() : promiseFromExec("npm run dev")),
    },
    "preset": {
        "install": async () =>
            DEBUG ? WAIT() : promiseFromExec("composer require laravel-frontend-presets/tailwindcss --dev -n"),
        "use": async (withAuth = false) =>
            DEBUG ? WAIT() : promiseFromExec(`php artisan preset ${withAuth ? "tailwindcss-auth" : "tailwindcss"}`),
        "remove": async () =>
            DEBUG ? WAIT() : promiseFromExec("composer remove laravel-frontend-presets/tailwindcss --dev -n"),
    },
}

const messages = {
    "npm": {
        "install": "Installing the NPM dependencies...",
        "build": "Building the static assets...",
    },
    "preset": {
        "install": "Installing the Tailwind preset...",
        "use": "Using the Tailwind preset...",
        "remove": "Removing the Tailwind preset...",
    },
    "done": "All done! Get building.",
    "docs": "You can find the docs at https://tailwindcss.com",
}

class Wizard extends Component {
    state = {
        step: "auth-question",
        status: undefined,
        withAuth: false,
    }

    async componentDidUpdate() {
        const { step, withAuth } = this.state

        if (step == "preset.install") {
            await commands.preset.install()
            this.setState({ step: "preset.use", status: messages.preset.use })
        }

        if (step == "preset.use") {
            await commands.preset.use(withAuth)
            this.setState({ step: "npm.install", status: messages.npm.install })
        }

        if (step == "npm.install") {
            await commands.npm.install()
            this.setState({ step: "npm.build", status: messages.npm.build })
        }

        if (step == "npm.build") {
            await commands.npm.build()
            this.setState({ step: "preset.remove", status: messages.preset.remove })
        }

        if (step == "preset.remove") {
            await commands.preset.remove()
            this.setState({ step: "done", status: undefined })
        }
    }

    handleAuthAnswer = item => {
        this.setState({ withAuth: item.value, step: "preset.install", status: messages.preset.install })
    }

    render() {
        const { step, withAuth } = this.state

        if (step == "done") {
            return this.renderDone()
        }

        if (step == "auth-question") {
            return this.renderAuthQuestion()
        }

        return this.renderInstall()
    }

    renderDone = () => {
        return (
            <Box flexDirection="column">
                <Box>
                    <Color cyanBright>{messages.done}</Color>
                </Box>
                <Box>
                    <Color cyanBright>{messages.docs}</Color>
                </Box>
            </Box>
        )
    }

    renderAuthQuestion = () => {
        const items = [
            {
                label: "Yes",
                value: true,
            },
            {
                label: "No",
                value: false,
            },
        ]

        return (
            <Box flexDirection="column">
                <Box>
                    <Color cyanBright>Include auth files?</Color>
                </Box>
                <Box>
                    <SelectInput items={items} onSelect={this.handleAuthAnswer} />
                </Box>
            </Box>
        )
    }

    renderInstall() {
        const { withAuth, status } = this.state

        return (
            <Box flexDirection="column">
                <Box>
                    <Color cyanBright>Generate auth files:</Color>{" "}
                    {withAuth ? <Color yellowBright>yes</Color> : <Color redBright>no</Color>}
                </Box>
                <Box>
                    <Color cyanBright>{status}</Color>
                </Box>
            </Box>
        )
    }
}

render(<Wizard />)
