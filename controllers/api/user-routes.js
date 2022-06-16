const router = require('express').Router();
const {User, Post, Vote, Comment} = require('../../models')

// GET /api/users
router.get('/', (req, res) => {
  User.findAll()
  .then(dbUserData => res.json(dbUserData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
})

// GET /api/users/1
router.get('/:id', (req, res) => {
  User.findOne({
    attribute: {exclude: ['password']},
    where: {
      id: req.params.id
    },
    include: [
      {
        model: Post,
        attributes: ['id', 'title', 'description', 'created_at']
      },
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'created_at'],
        include: {
          model: Post,
          attributes: ['title']
        }
      },
      {
        model: Post,
        attributes: ['title'],
        through: Vote,
        as: 'voted_posts'
      }
    ]
  })
  .then(dbUserData => {
    if (!dbUserData) {
      res.status(404).json({ message: 'No user found with this id' });
      return;
    }
    res.json(dbUserData)
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err)
  })
})

// POST /api/users
router.post('/', (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
  .then(dbUserData => res.json(dbUserData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
})

// LOGIN request
router.post('/login', (req, res) => {
  //searches the API for a matching email
  User.findOne({
    where: {
      email: req.body.email
    }
  })
  .then(dbUserData => {
    if(!dbUserData) {
      res.status(400).json({message: 'No user with that email'});
      return;
    }
    //checks if the password matches the email it's attached to.
    const validPassword = dbUserData.checkPassword(req.body.password);
    if (!validPassword) {
      req.status(400).json({message: 'Incorrect password.'});
      return;
    }
    res.json({user: dbUserData, message: 'You are now logged in!'})
  })
})

// PUT /api/users/1
router.put('/:id', (req, res) => {
  User.update(req.body, {
    where: {
      id: req.params.id
    }
  })
  .then(dbUserData => {
    if (!dbUserData) {
      res.status(404).json({message: 'No user found with this id'})
      return;
    }
    res.json(dbUserData)
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
})

// DELETE /api/users/1
router.delete('/:id', (req, res) => {
  User.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(dbUserData => {
    if (!dbUserData) {
      res.status(404).json({ message: 'No user found with this id'});
      return;
    }
    res.json(dbUserData)
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
})

module.exports = router;