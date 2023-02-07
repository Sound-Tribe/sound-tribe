module.exports = {
  isLoggedIn: (req, res, next) => {
    if (!req.session.currentUser) {
      res.redirect('/auth/login');
    } else {
      next();
    }
  },
  isTribe: (req, res, next) => {
    if (req.session.currentUser.type === 'tribe') {
      next();
    } else {
      res.redirect('back');
    }
  },
  isFan: (req, res, next) => {
    if (req.session.currentUser.type === 'fan') {
      next();
    } else {
      res.redirect('back');
    }
  }
}