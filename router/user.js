const express = require('express')
const router = new express.Router()
const User = require('../models/user');
const auth = require('../middleware/auth')


//View profile
router.get('/user/me', auth, async (req,res) => {
  res.send(req.user)
});

// //Update profile
// router.patch('/updateProfile', auth, async ( req, res) => {
//     const _id = req.user._id;
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['Name']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperation){
//         return res.status(400).send({
//             error: "Invalid updates requested."})
//     }
//     try{
//         updates.forEach(update => req.user[update] = req.body[update]);
//         await req.user.save();
//         res.send(req.user)
//     }catch(e){
//         res.status(400).send(e);
//         //res.status(500).send(e);
// })

// //Change password
// router.patch('/updatePassword', auth, async (req,res) => {
//   const user = req.user
//   try{
//     await user.changePassword(req.body.oldPassword, req.body.newPassword)
//     res.send('Password has been successfully updated.')
//   }catch(e){
//     res.send(e)
//   }
    
// });


//Change password
router.patch('/user/updatePassword', auth, async (req,res) => {
  const _id = req.user._id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['password']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isValidOperation){
      return res.status(400).send({
          error: "Invalid updates requested."})
  }
  try{
      updates.forEach(update => req.user[update] = req.body[update]);
      await req.user.save();
      res.send('Password has been successfully updated.')
  }catch(e){
      res.status(400).send(e);
  }   
});


module.exports = router