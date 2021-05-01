const express = require('express')
const router = express.Router()

const deviceTypeController = require('../controllers/device/device-typeController')
const deviceController = require('../controllers/device/deviceController')
const prodLineController = require('../controllers/device/prod-lineController')

const raportController = require('../controllers/raportController')

const userController = require('../controllers/userController')
const operation_controller = require('../controllers/device/operationController')
const masterplan_controller = require('../controllers/masterplanController')

//to authenticate specific routes, add auth.authTech/authSpec/authAdmin to middleware
const auth = require('./verifyToken')
// adds verifiedId with logged in user ID and verifiedPerm with logged users permision in req
// LOGING // 1st Page layout
router.post('/zaloguj', userController.user_POST_login)
router.get('/zaloguj', userController.user_GET_login)

// OPERATIONS //
// GET request for creating new line
router.get(
  '/operation/create',
  auth.authTech,
  operation_controller.operation_create_get
)

// POST request for creating new operation
router.post(
  '/operation/create',
  auth.authTech,
  operation_controller.operation_create_post
)

// GET request to delete operation
router.get(
  '/operation/:id/delete',
  auth.authTech,
  operation_controller.operation_delete_get
)

// POST request to delete operation
router.post(
  '/operation/:id/delete',
  auth.authTech,
  operation_controller.operation_delete_post
)

// GET request to update operation
router.get(
  '/operation/:id/update',
  auth.authTech,
  operation_controller.operation_update_get
)

// POST request to update operation
router.post(
  '/operation/:id/update',
  auth.authTech,
  operation_controller.operation_update_post
)

// GET request for list of all device items
router.get('/operation', auth.authTech, operation_controller.operation_list)

// GET request for one device item
router.get(
  '/operation/:id',
  auth.authTech,
  operation_controller.operation_detail
)

/// PLANS ///

// GET request for creating new MASTERPLAN
router.get('/masterplan/create', masterplan_controller.masterplan_create_get)

// POST request for creating new masterplan
router.post('/masterplan/create', masterplan_controller.masterplan_create_post)

// GET request to delete masterplan
router.get(
  '/masterplan/:id/delete',
  masterplan_controller.masterplan_delete_get
)

// POST request to delete masterplan
router.post(
  '/masterplan/:id/delete',
  masterplan_controller.masterplan_delete_post
)

// GET request to update masterplan
router.get(
  '/masterplan/:id/update',
  masterplan_controller.masterplan_update_get
)

// POST request to update masterplan
router.post(
  '/masterplan/:id/update',
  masterplan_controller.masterplan_update_post
)

// GET request for list of all device items
router.get('/masterplan', masterplan_controller.masterplan_list)

// GET request for one device item
router.get('/masterplan/:id', masterplan_controller.masterplan_detail)

/// DEVICES ///

//GET all devices
router.get('/urzadzenia', auth.authTech, deviceController.device_GET_all)

// GET for creating device
router.get('/urzadzenia/dodaj', auth.authTech, deviceController.device_GET_add)

//POST for creating device
router.post(
  '/urzadzenia/dodaj',
  auth.authTech,
  deviceController.device_POST_add
)

//GET for updating device
router.get(
  '/urzadzenia/:id/edytuj',
  auth.authTech,
  deviceController.device_GET_update
)

//POST for updating device
router.post(
  '/urzadzenia/:id/edytuj',
  auth.authTech,
  deviceController.device_POST_update
)

//DELETE for deleting device
router.get(
  '/urzadzenia/:id/usun',
  auth.authTech,
  deviceController.device_GET_delete
)
//DELETE post for deleting device
router.post(
  '/urzadzenia/:id/usun',
  auth.authTech,
  deviceController.device_POST_delete
)

//GET specific device
router.get('/urzadzenia/:id', auth.authTech, deviceController.device_GET_one)

//CZY GET TEŻ DLA DELETE?????

/// DEVICE TYPES ///

//GET all device types
router.get(
  '/typy-urzadzen',
  auth.authTech,
  deviceTypeController.deviceType_GET_all
)

// GET for creating device type
router.get(
  '/typy-urzadzen/dodaj',
  auth.authTech,
  deviceTypeController.deviceType_GET_add
)

//POST for creating device type
router.post(
  '/typy-urzadzen/dodaj',
  auth.authTech,
  deviceTypeController.deviceType_POST_add
)

//GET for updating device type
router.get(
  '/typy-urzadzen/:id/edytuj',
  auth.authTech,
  deviceTypeController.deviceType_GET_update
)

//POST for updating device type
router.post(
  '/typy-urzadzen/:id/edytuj',
  auth.authTech,
  deviceTypeController.deviceType_POST_update
)

//DELETE for deleting device type
router.get(
  '/typy-urzadzen/:id/usun',
  auth.authTech,
  deviceTypeController.deviceType_GET_delete
)
//DELETE for deleting device type
router.post(
  '/typy-urzadzen/:id/usun',
  auth.authTech,
  deviceTypeController.deviceType_POST_delete
)

//GET specific device type
router.get(
  '/typy-urzadzen/:id',
  auth.authTech,
  deviceTypeController.deviceType_GET_one
)

/// PRODUCTION LINES ///

//GET all prod-lines
router.get(
  '/linie-produkcyjne',
  auth.authTech,
  prodLineController.prodLine_GET_all
)

// GET for creating prod-line
router.get(
  '/linie-produkcyjne/dodaj',
  auth.authTech,
  prodLineController.prodLine_GET_add
)

//POST for creating prod-line
router.post(
  '/linie-produkcyjne/dodaj',
  auth.authTech,
  prodLineController.prodLine_POST_add
)

//GET for updating prod-line
router.get(
  '/linie-produkcyjne/:id/edytuj',
  auth.authTech,
  prodLineController.prodLine_GET_update
)

//POST for updating prod-line
router.post(
  '/linie-produkcyjne/:id/edytuj',
  auth.authTech,
  prodLineController.prodLine_POST_update
)

//GET for deleting prod-line
router.get(
  '/linie-produkcyjne/:id/usun',
  auth.authTech,
  prodLineController.prodLine_GET_delete
)

//POST for deleting prod-line
router.post(
  '/linie-produkcyjne/:id/usun',
  auth.authTech,
  prodLineController.prodLine_POST_delete
)

//GET specific prod-line
router.get('/linie-produkcyjne/:id', prodLineController.prodLine_GET_one)

/// RAPORT ///

//GET raports list /// HOME PAGE AFTER LOGIN///
router.get('/raporty', auth.authTech, raportController.raport_GET_list)

//GET for this shifts raport summary /// only technicians will use this --
router.get(
  '/raporty/moj-raport',
  auth.authTech,
  raportController.raport_GET_myRaport
)

//GET for this shifts raports first section // kurwa nie wiem jak nazwać to gówno po and i po polsku
router.get(
  '/raporty/moj-raport/zestawienie',
  auth.authTech,
  raportController.raport_GET_firstSection
)

//GET for this users + shifts failures
router.get(
  '/raporty/moj-raport/awarie',
  auth.authTech,
  raportController.raport_GET_failures
)

//GET for updating raport
router.get(
  '/raporty/:id/edytuj',
  auth.authTech,
  raportController.raport_GET_update
)

//POST for updating raport
router.post(
  '/raporty/:id/edytuj',
  auth.authTech,
  raportController.raport_POST_update
)

//GET specific raport
router.get('/raporty/:id', auth.authTech, raportController.raport_GET_one)

/// FAILURE STUFF
//SAVE FAILURE -- FETCH URL // save failure for specific raport id
router.post(
  '/zapisz-awarie/:id',
  auth.authTech,
  raportController.raport_POST_saveFailure
)

//DELETE FAILURE -- FETCH URL // delete specific failure for specific raport
router.post(
  '/usun-awarie/:id',
  auth.authTech,
  raportController.raport_POST_deleteFailure
)

///RAPORT MINORS HERE
/// RAPORT TEAM SAVE -- FETCH URL // save/override team members for the raport
router.post(
  '/zapisz-sklad/:id',
  auth.authTech,
  raportController.raport_POST_saveTeam
)

//RAPORT SAVE ROUNDAROUND -- FETCH URL // save/override for raport
router.post(
  '/zapisz-obchod/:id',
  auth.authTech,
  raportController.raport_POST_saveRoundAround
)

//RAPORT SAVE ADDITIONAL INFO -- FETCH URL
router.post(
  '/zapisz-dodatkowe-info/:id',
  auth.authTech,
  raportController.raport_POST_saveAdditionalInfo
)

/// USER ///

//GET all users
router.get('/uzytkownicy', auth.authTech, userController.user_GET_all)

//GET create user
router.get('/uzytkownicy/dodaj', auth.authAdmin, userController.user_GET_add)

//POST create user
router.post('/uzytkownicy/dodaj', auth.authAdmin, userController.user_POST_add)

//GET update user
router.get(
  '/uzytkownicy/:id/edytuj',
  auth.authAdmin,
  userController.user_GET_update
)

//POST update user
router.post(
  '/uzytkownicy/:id/edytuj',
  auth.authAdmin,
  userController.user_POST_update
)

//GET delete user
router.get(
  '/uzytkownicy/:id/usun',
  auth.authAdmin,
  userController.user_GET_delete
)

//POST delete user
router.post(
  '/uzytkownicy/:id/usun',
  auth.authAdmin,
  userController.user_POST_delete
)

//GET specific user
router.get('/uzytkownicy/:id', auth.authTech, userController.user_GET_one)

/// SHIFT MAGANMENT ///
//GET shift maganment
router.get('/zmiany', auth.authAdmin, userController.user_GET_shift)

//POST new shift
router.post('/zmiany', auth.authAdmin, userController.user_POST_shift)

module.exports = router
