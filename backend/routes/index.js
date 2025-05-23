var express = require('express');
const { SignUp, Login, createProject, saveProjects, getProjects, selectProject, deleteProject, Logout } = require('../controllers/user.controllers');
const { isAuth } = require('../middleware/user.middleware');
const { getUserData } = require('../controllers/userData.controllers');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup',SignUp)
router.post('/login',Login);
router.post('/createproject',createProject);
router.post('/saveproject',saveProjects)
router.get('/getprojects',getProjects);
router.get("/getUser",isAuth,getUserData);
router.get('/selectproject/:id',selectProject);
router.get('/deleteproject/:id',deleteProject)
router.post('/logout',Logout)

module.exports = router;
