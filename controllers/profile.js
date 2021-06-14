const profileRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Profile = require('../models/profile')

profileRouter.route('/:id/watchlist')
  .get(async (req, res) => {
    const watchlist = await Profile.findById(req.params.id).populate('watchlist.media_id')
    console.log(watchlist);
    res.json(watchlist)
  })
  .post(async (req, res) => {
    const { media_id, date_added } = req.body

    try {
      await jwt.verify(req.token, process.env.SECRET)
    } catch(error) {
      return res.status(401).json({ error: 'token invalid or missing' })
    }

    const profile = await Profile.findById(req.params.id)

    profile.watchlist.push({
      media_id: media_id,
      date_added: date_added
    })

    const savedProfile = await profile.save()
    
    res.status(201).json(savedProfile)
  })
  .delete(async (req, res) => {
    const body = req.body
    console.log(body);

    try {
      await jwt.verify(req.token, process.env.SECRET)
    } catch(error) {
      return res.status(401).json({ error: 'token invalid or missing' })
    }

    const profile = await Profile.findById(req.params.id)

    profile.watchlist.remove(body.media_id)

    await profile.save()
    
    res.status(204).end()
  })
profileRouter.route('/:id/watched')
  .post(async (req, res) => {
    const body = req.body

    try {
      await jwt.verify(req.token, process.env.SECRET)
    } catch(error) {
      return res.status(401).json({ error: 'token invalid or missing' })
    }

    const profile = await Profile.findById(req.params.id)

    profile.watched.push(body.media_id)

    const savedProfile = await profile.save()
    
    res.status(201).json(savedProfile)
  })
  .delete(async (req, res) => {
    const body = req.body

    let decodedToken
    try {
      decodedToken = await jwt.verify(req.token, process.env.SECRET)
    } catch(error) {
      return res.status(401).json({ error: 'token invalid or missing' })
    }

    const profile = await Profile.findById(req.params.id)

    profile.watched.remove(body.media_id)

    await profile.save()
    
    res.status(204).end()
  })

module.exports = profileRouter