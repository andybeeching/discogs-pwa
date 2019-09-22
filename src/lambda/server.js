import express from 'express'
import serverless from 'serverless-http'
import createServer from '../server/server'

const app = createServer(express())

// netlify mount point
app.use('/.netlify/functions/server', app)

// serverless maps AWS requests to express
// handler required by Netlify
export const handler = serverless(app)
