var express = require('express');
const {
  SignUp,
  Login,
  createProject,
  saveProjects,
  getProjects,
  selectProject,
  deleteProject,
  Logout,
  getUser, // ✅ Import getUser here
} = require('../controllers/user.controllers');
const { isAuth } = require('../middleware/user.middleware');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup', SignUp);
router.post('/login', Login);
router.post('/createproject', createProject);
router.post('/saveproject', saveProjects);
router.get('/getprojects', getProjects);
router.get('/getUser', isAuth, getUser); // ✅ Use getUser, not getUserData
router.get('/selectproject/:id', selectProject);
router.get('/deleteproject/:id', deleteProject);
router.post('/logout', Logout);

module.exports = router;
