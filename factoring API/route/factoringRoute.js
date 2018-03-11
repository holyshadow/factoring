'use strict';
module.exports = function(app) {
var factoring = require('../controller/factoringController');

  app.route('/')
     .get(factoring.get_req)

  app.route('/bank')
     .get(factoring.listall_bank)

  app.route('/bank')
     .post(factoring.register_bank)
  app.route('/approvePO')
     .post(factoring.approve_PO)
  app.route('/approveINV')
     .post(factoring.approve_INV)
  app.route('/approveFAC')
     .post(factoring.approve_FAC)
  app.route('/createPO')
     .post(factoring.register_PO)
  app.route('/createINV')
     .post(factoring.register_INV)
  app.route('/requestFAC')
     .post(factoring.register_FAC)
  app.route('/showPO')
    .get(factoring.list_PO)
  app.route('/showINV')
    .get(factoring.list_INV)
  app.route('/showFAC')
    .get(factoring.list_FAC)
};
