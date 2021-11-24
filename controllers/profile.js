const profileRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Profile = require('../models/profile')

profileRouter.get('/:id', async (req, res) => {
  const profile = await Profile.findById(req.params.id)

  res.json(profile)
})

// profileRouter.route('/:id/watchlist')
  // .get(async (req, res) => {
  //   const watchlist = await Profile.findById(req.params.id).populate('watchlist.media')

  //   res.json(watchlist) 
  // })
  // .post(async (req, res) => {
  //   const { media_id, date_added } = req.body

  //   try {
  //     await jwt.verify(req.token, process.env.SECRET)
  //   } catch(error) {
  //     return res.status(401).json({ error: 'token invalid or missing' })
  //   }

  //   const profile = await Profile.findById(req.params.id)

  //   profile.watchlist.push({
  //     media_id: media_id,
  //     media: media_id,
  //     date_added: date_added
  //   })

  //   const savedProfile = await profile.save()
    
  //   res.status(201).json(savedProfile)
  // })

// profileRouter.delete('/:id/watchlist/:watchlistId', 
//   async (req, res) => {
//     try {
//       await jwt.verify(req.token, process.env.SECRET)
//     } catch(error) {
//       return res.status(401).json({ error: 'token invalid or missing' })
//     }
    
//     console.log('HERERE');
//     const profile = await Profile.findById(req.params.id)

//     profile.watchlist.remove(req.params.watchlistId)

//     await profile.save()
    
//     res.status(204).end()
//   })
  
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