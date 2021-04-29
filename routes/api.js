const express = require('express');
const router = express.Router();

const deviceTypeController = require('../controllers/device/device-typeController');
const deviceController = require('../controllers/device/deviceController');
const prodLineController = require('../controllers/device/prod-lineController');

const raportController = require('../controllers/raportController');

const userController = require('../controllers/userController')

// LOGING // 1st Page layout
router.post('/zaloguj', userController.user_POST_login);
router.get('/zaloguj', userController.user_GET_login);

/// DEVICES ///

//GET all devices
router.get('/urzadzenia', deviceController.device_GET_all);

// GET for creating device
router.get('/urzadzenia/dodaj', deviceController.device_GET_add);

//POST for creating device
router.post('/urzadzenia/dodaj', deviceController.device_POST_add);

//GET for updating device
router.get('/urzadzenia/:id/edytuj', deviceController.device_GET_update);

//POST for updating device
router.post('/urzadzenia/:id/edytuj', deviceController.device_POST_update);

//DELETE for deleting device
router.get('/urzadzenia/:id/usun', deviceController.device_GET_delete);

//GET specific device
router.get('/urzadzenia/:id', deviceController.device_GET_one);

//CZY GET TEŻ DLA DELETE?????

/// DEVICE TYPES ///

//GET all device types
router.get('/typy-urzadzen', deviceTypeController.deviceType_GET_all);

// GET for creating device type
router.get('/typy-urzadzen/dodaj', deviceTypeController.deviceType_GET_add);

//POST for creating device type
router.post('/typy-urzadzen/dodaj', deviceTypeController.deviceType_POST_add);

//GET for updating device type
router.get('/typy-urzadzen/:id/edytuj', deviceTypeController.deviceType_GET_update);

//POST for updating device type
router.post('/typy-urzadzen/:id/edytuj', deviceTypeController.deviceType_POST_update);

//DELETE for deleting device type
router.delete('/typy-urzadzen/:id', deviceTypeController.deviceType_GET_DELETE);

//GET specific device type
router.get('/typy-urzadzen/:id', deviceTypeController.deviceType_GET_one);

/// PRODUCTION LINES /// 

//GET all prod-lines
router.get('/linie-produkcyjne', prodLineController.prodLine_GET_all);

// GET for creating prod-line
router.get('/linie-produkcyjne/dodaj', prodLineController.prodLine_GET_add);

//POST for creating prod-line
router.post('/linie-produkcyjne/dodaj',prodLineController.prodLine_POST_add);

//GET for updating prod-line
router.get('/linie-produkcyjne/:id/edytuj', prodLineController.prodLine_GET_update);

//POST for updating prod-line
router.post('/linie-produkcyjne/:id/edytuj', prodLineController.prodLine_POST_update);

//GET for deleting prod-line
router.get('/linie-produkcyjne/:id/usun', prodLineController.prodLine_GET_delete);

//GET specific prod-line
router.get('/linie-produkcyjne/:id', prodLineController.prodLine_GET_one);

/// RAPORT ///

//GET raports list /// HOME PAGE /// 
router.get('/raporty', raportController.raport_GET_list);

//GET for creating raport
router.get('/raporty/moj-raport', raportController.raport_GET_myRaport) 

//GET for updating raport
router.get('/raporty/:id/edytuj', raportController.raport_GET_update);

//POST for updating raport
router.post('/raporty/:id/edytuj', raportController.raport_POST_update);

//GET specific raport
router.get('/raporty/:id', raportController.raport_GET_one);

/// FAILURE STUFF 
//SAVE FAILURE -- FETCH URL // save failure for specific raport id
router.post('/zapisz-awarie/:id', raportController.raport_POST_saveFailure)

//DELETE FAILURE -- FETCH URL // delete specific failure for specific raport
router.post('/usun-awarie/:id', raportController.raport_POST_deleteFailure)

///RAPORT MINORS HERE
/// RAPORT TEAM SAVE -- FETCH URL // save/override team members for the raport
router.post('/zapisz-sklad/:id', raportController.raport_POST_saveTeam)

//RAPORT SAVE ROUNDAROUND -- FETCH URL // save/override for raport
router.post('/zapisz-obchod/:id', raportController.raport_POST_saveRoundAround)

//RAPORT SAVE ADDITIONAL INFO -- FETCH URL
router.post('/zapisz-dodatkowe-info/:id', raportController.raport_POST_saveAdditionalInfo)

/// USER /// 

//GET all users
router.get('/uzytkownicy', userController.user_GET_all);

//GET create user
router.get('/uzytkownicy/dodaj', userController.user_GET_add);

//POST create user
router.post('/uzytkownicy/dodaj', userController.user_POST_add);

//GET update user
router.get('/uzytkownicy/:id/edytuj', userController.user_GET_update);

//POST update user
router.post('/uzytkownicy/:id/edytuj', userController.user_POST_update);

//GET delete user
router.get('/uzytkownicy/:id/usun', userController.user_GET_delete);

//GET specific user
router.get('/uzytkownicy/:id', userController.user_GET_one)

/// SHIFT MAGANMENT ///
//GET shift maganment
router.get('/zmiany', userController.user_GET_shift)

//POST new shift
router.post('/zmiany', userController.user_POST_shift)

module.exports = router;