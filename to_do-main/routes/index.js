const express = require('express');
const bodyParser  = require("body-parser");
const router  = express.Router();
const {ensureAuthenticated, authRole} = require('../config/auth')
const {ROLE} = require('../config/roles')
const {UserReq, User} = require("../models/user");

//login page
router.get('/', (req,res)=>{
    res.render('welcome');
})
//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

router.get('/dashboard',ensureAuthenticated, (req,res)=>{
    res.render('dashboard',{
        user: req.user
    });
})


router.get('/admin', ensureAuthenticated, authRole(ROLE.ADMIN), async function(req, res) {
    let query = UserReq.find()
        try {
            const users = await query.exec()
            res.render('admin', {
                users: users,
            })
        } catch {
            res.redirect('/')
        }
})

router.post('/admin', async function(req, res) {
  //console.log(req.body);
  console.log("req recived")
  //console.log(req.body)

  console.log(req.body)
  switch (req.body.formInstance) {
    case 'pendingUser':
      console.log('pendingUser')

      if (req.body.choice == 'decline') {
          UserReq.findOneAndDelete({email: req.body.email}, function(err,obj) {
            if (err) {
              console.log(err)
            }
            console.log('Declined user: ', obj)
          });
      } else if (req.body.choice == 'accept') {
          UserReq.findOne({email: req.body.email}, async function(err,obj) { return obj })
          .then(res =>{ //callback function
              user = new User(res)
              user.isNew = true;
              console.log(user)
              user.save(function(error, savedDocument) {
                  if (error) console.log(error)
                  else {
                    console.log(savedDocument + " has been saved");
                    UserReq.findOneAndDelete({email: req.body.email}, function(err,obj) {})
                  }

              })
          })

      }


    break;
    case 'userRole':
      console.log(req.body.userRole)

      // `doc` is the document _after_ `update` was applied because of
      // `returnOriginal: false`
      User.findOneAndUpdate({email: req.body.email}, { role: req.body.userRole }, function(err,obj) {
        if (err) {
          console.log(err)
        }
        console.log('changes role for user: ', obj)
      });




    break;
    default:

  }





  res.redirect('/admin')
})

async function dbSave(myData, res) {

}






module.exports = router;
