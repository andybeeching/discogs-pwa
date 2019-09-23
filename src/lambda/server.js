import express from 'express'
import serverless from 'serverless-http'
import createServer from '../server/server'
import createRouter from '../server/router'

const app = createServer(express())
const router = createRouter()

// netlify mount point
app.use('/', router)
app.use('/.netlify/functions/server', router)

// serverless maps AWS requests to express
// handler required by Netlify
export const handler = serverless(app)
