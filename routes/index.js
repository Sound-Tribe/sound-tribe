const router = require('express').Router();

// @desc    App home page. Redirects to /discover if not logged in. Redirects to /home if logged in
// @route   GET /
// @access  Public
router.get('/', (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/home');
  } else {
    res.redirect('/discover');
  }
});

// @desc    Discover page. Random content if not logged in. Addapted to interests if logged in
// @route   GET /discover
// @access  Public & Private
router.get('/discover', (req, res, next) => {
  res.render('discover')
})
module.exports = router;
