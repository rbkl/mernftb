const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Get Post Schema
const Post = require('../../models/Post');

// Get Profile Schema
const Profile = require('../../models/Profile');

// Load validations
const validatePostInput = require('../../validation/post')

// @route   GET api/posts/test
// @desc    Tests posts routes
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"}));

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
  .sort({ date: -1})
  .then(posts => res.json(posts))
  .catch(err => res.status(404).json({nopostfound: 'No posts found'}));
});

// @route   GET api/posts/:post_id
// @desc    Get post by id
// @access  Public
router.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
  .then(post => res.json(post))
  .catch(err => res.status(404).json({nopostfound: 'No post found with that id.'}));
});


// @route   POST api/posts
// @desc    Create posts
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if(!isValid) {
    // If any errors, send 400 with errors
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
})

// @route   DELETE api/posts/:post_id
// @desc    Get post by id
// @access  Private
router.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    Post.findById(req.params.post_id)
    .then(post => {
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({notauthorized: 'User not authorized'});
      } else {
        post.remove().then(() => res.json({success: true}));
      }
    })
    .catch(err => res.status(404).json({nopostfound: 'No post found'}));
  })
});


// @route   POST api/posts/like/:post_id
// @desc    Like a post by id
// @access  Private
router.post('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    Post.findById(req.params.post_id)
    .then(post => {
      if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json({ alreadyliked: 'User has already liked this post'})
      }
        // Add user id to likes array
        post.likes.unshift({ user: req.user.id });

        post.save().then(post => res.json(post));

    })
    .catch(err => res.status(404).json({nopostfound: 'No post found'}));
  })
});

// @route   POST api/posts/unlike/:post_id
// @desc    Unlike a post by id
// @access  Private
router.post('/unlike/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    Post.findById(req.params.post_id)
    .then(post => {
      if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        return res.status(400).json({ notliked: 'User has not liked this post'});
      }
        // Get remove index
        const removeIndex = post.likes
        .map(item => item.user.toString())
        .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        // Save the post
        post.save().then(post => res.json(post));

    })
    .catch(err => res.status(404).json({nopostfound: 'No post found 2'}));
  })
});


// @route   POST api/posts/comment/:post_id
// @desc    Add comment to a post by id
// @access  Private
router.post('/comment/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if(!isValid) {
    // If any errors, send 400 with errors
    return res.status(400).json(errors);
  }

  Post.findById(req.params.post_id)
  .then(post => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    }

    // Add to comments array
    post.comments.unshift(newComment);

    // Save the posts
    post.save()
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
  })
});


// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Delete a comment by id from a post by id
// @access  Private
router.delete('/comment/:post_id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  Post.findById(req.params.post_id)
  .then(post => {
    // Check to see if comment exists
    if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
      return res.status(404).json({ commentnotexist: 'Comment does not exist'})
    }


    // Get remove index
    const removeIndex = post.comments
    .map(comment => comment._id.toString())
    .indexOf(req.params.comment_id);

    // Splice out comment of array

    post.comments.splice(removeIndex, 1);

    // Save the posts
    post.save()
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
  })
});


module.exports = router;
