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

module.exports = router;
