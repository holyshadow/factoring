'use strict';
var assert = require('assert');
var clients = require('restify-clients'); 
var _ = require("underscore");

var g_result;
var client = clients.createJsonClient({
  url: 'http://localhost:3000'
});


exports.get_req = function(req, res){
  res.send("Welcome to Factoring API")
 };

exports.listall_bank = function(req, res){
  
  client.get('/api/Bank', function(err,req,resp,obj){
      assert.ifError(err);
      res.json(obj);
  });
 };

exports.list_PO = function(req, res){
  var sponsor = (req.param('sponsor'));
  var supplier = (req.param('supplier'));


  console.log("sponnsor:" +sponsor);
  console.log("supplier:" +supplier);
  if (!sponsor && !supplier){//list all PO
      client.get('/api/PurchaseOrder', function(err,req,resp,obj){
        assert.ifError(err);
        res.json(AdjustPO(obj));
      });
  }else if(!sponsor){//filter by supplier
      client.get('/api/PurchaseOrder', function(err,req,resp,obj){
        assert.ifError(err);
        supplier = replaceAll(supplier," ","%20");
        var filtered = _.where(obj,{supplier: "resource:org.krungsri.factoring.User#"+supplier});
        
        res.json(AdjustPO(filtered));
      });
  }else if (!supplier){//filter by sponsor
      client.get('/api/PurchaseOrder', function(err,req,resp,obj){
        assert.ifError(err);
        sponsor = replaceAll(sponsor," ","%20");
        var filtered = _.where(obj,{sponsor: "resource:org.krungsri.factoring.User#"+sponsor});
       
        res.json(AdjustPO(filtered));
      });
  }else{// filter by sponsor and suplier
    client.get('/api/PurchaseOrder', function(err,req,resp,obj){
      assert.ifError(err);
      supplier = replaceAll(supplier," ","%20");
      sponsor = replaceAll(sponsor," ","%20");
      var filtered = _.where(obj,{sponsor: "resource:org.krungsri.factoring.User#"+sponsor});
      filtered = _.where(filtered,{supplier: "resource:org.krungsri.factoring.User#"+supplier});
      res.json(AdjustPO(filtered));
    });
  }
 };
exports.list_INV = function(req, res){
  var sponsor = (req.param('sponsor'));
  var supplier = (req.param('supplier'));

  if (!sponsor && !supplier){//list all Inv
    var Inv_data;
    var PO_data;
    var respond;
    var respond_arr = [];
    new Promise((resolve, reject) => {
        client.get('/api/Invoice', function(err,req,resp,obj){
          assert.ifError(err);
          Inv_data = obj;
        // console.log(Inv_data);
          resolve("Got Invoice");
        });
      }).then((status) => {
          console.log("status:", status);
          return new Promise((resolve, reject) => {
              client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                assert.ifError(err);
                PO_data =obj;
              // console.log(PO_data);
                resolve("Got PO");
              });
          }).then((status) => {
              console.log("status:", status);
              for(var i=0; i<Inv_data.length;i++){
                  var Invobj = Inv_data[i];
                  var respond = {
                    invoiceId: Invobj['invId'],
                    invoiceNumber: Invobj['invoiceNumber'],
                    invoiceDetail:  Invobj['detailInvoive'],
                    invoiceAmount:  Invobj['invoiceAmount'],
                    createdDate:  formatDate(Invobj['createDate']),
                    status:  Invobj['currentStatus']
                  };
                  respond.sponsor = Invobj['sponsor'].substring(Invobj['sponsor'].indexOf('#')+1);
                  respond.supplier = Invobj['supplier'].substring(Invobj['supplier'].indexOf('#')+1);
                  if(!!Invobj['updateDate']){
                        respond.updatedDate = formatDate(Invobj['updateDate']);
                  }
                  var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                  for(var j=0 ; j<PO_data.length;j++){
                      if(POID == PO_data[j]['poId']){
                        respond.poId = PO_data[j]['poId'];
                        respond.poNumber = PO_data[j]['poNumber'];
                        respond.poDetail = PO_data[j]['detail'];
                        respond.poAmount = PO_data[j]['poAmount'];
                      }
                  }                
                  respond_arr.push(respond);
              }
              res.json(respond_arr);
          })
      })
  }else if(!sponsor){//filter by supplier
    var Inv_data;
    var PO_data;
    var respond;
    var respond_arr = [];
    supplier = replaceAll(supplier," ","%20");
    new Promise((resolve, reject) => {
        client.get('/api/Invoice', function(err,req,resp,obj){
          assert.ifError(err);
          Inv_data = obj;
          resolve("Got Invoice");
        });
      }).then((status) => {
          console.log("status:", status);
          return new Promise((resolve, reject) => {
              client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                assert.ifError(err);
                PO_data =obj;
              // console.log(PO_data);
                resolve("Got PO");
              });
          }).then((status) => {
              console.log("status:", status);
              for(var i=0; i<Inv_data.length;i++){
                if(("resource:org.krungsri.factoring.User#"+supplier) == Inv_data[i]['supplier']){
                  var Invobj = Inv_data[i];
                  var respond = {
                    invoiceId: Invobj['invId'],
                    invoiceNumber: Invobj['invoiceNumber'],
                    invoiceDetail:  Invobj['detailInvoive'],
                    invoiceAmount:  Invobj['invoiceAmount'],
                    createdDate:  formatDate(Invobj['createDate']),
                    status:  Invobj['currentStatus']
                  };
                  respond.sponsor = replaceAll(Invobj['sponsor'].substring(Invobj['sponsor'].indexOf('#')+1),"%20"," ");
                  respond.supplier = replaceAll(Invobj['supplier'].substring(Invobj['supplier'].indexOf('#')+1),"%20"," ");
                  if(!!Invobj['updateDate']){
                        respond.updatedDate = formatDate(Invobj['updateDate']);
                  }
                  var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                  for(var j=0 ; j<PO_data.length;j++){
                      if(POID == PO_data[j]['poId']){
                        respond.poId = PO_data[j]['poId'];
                        respond.poNumber = PO_data[j]['poNumber'];
                        respond.poDetail = PO_data[j]['detail'];
                        respond.poAmount = PO_data[j]['poAmount'];
                      }
                  }                
                  respond_arr.push(respond);
                }
                  
              }
              res.json(respond_arr);
          })
      })
  }else if (!supplier){//filter by sponsor
    var Inv_data;
    var PO_data;
    var respond;
    var respond_arr = [];
    sponsor = replaceAll(sponsor," ","%20");
    new Promise((resolve, reject) => {
        client.get('/api/Invoice', function(err,req,resp,obj){
          assert.ifError(err);
          Inv_data = obj;
          resolve("Got Invoice");
        });
      }).then((status) => {
          console.log("status:", status);
          return new Promise((resolve, reject) => {
              client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                assert.ifError(err);
                PO_data =obj;
              // console.log(PO_data);
                resolve("Got PO");
              });
          }).then((status) => {
              console.log("status:", status);
              for(var i=0; i<Inv_data.length;i++){
                if(("resource:org.krungsri.factoring.User#"+sponsor) == Inv_data[i]['sponsor']){
                  var Invobj = Inv_data[i];
                  var respond = {
                    invoiceId: Invobj['invId'],
                    invoiceNumber: Invobj['invoiceNumber'],
                    invoiceDetail:  Invobj['detailInvoive'],
                    invoiceAmount:  Invobj['invoiceAmount'],
                    createdDate:  formatDate(Invobj['createDate']),
                    status:  Invobj['currentStatus']
                  };
                  respond.sponsor = replaceAll(Invobj['sponsor'].substring(Invobj['sponsor'].indexOf('#')+1),"%20"," ");
                  respond.supplier = replaceAll(Invobj['supplier'].substring(Invobj['supplier'].indexOf('#')+1),"%20"," ");                  
                  if(!!Invobj['updateDate']){
                        respond.updatedDate = formatDate(Invobj['updateDate']);
                  }
                  var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                  for(var j=0 ; j<PO_data.length;j++){
                      if(POID == PO_data[j]['poId']){
                        respond.poId = PO_data[j]['poId'];
                        respond.poNumber = PO_data[j]['poNumber'];
                        respond.poDetail = PO_data[j]['detail'];
                        respond.poAmount = PO_data[j]['poAmount'];
                      }
                  }                
                  respond_arr.push(respond);
                }
                  
              }
              res.json(respond_arr);
          })
      })
  }else{// filter by sponsor and suplier
    var Inv_data;
    var PO_data;
    var respond;
    var respond_arr = [];
    sponsor = replaceAll(sponsor," ","%20");
    supplier = replaceAll(supplier," ","%20");
    new Promise((resolve, reject) => {
        client.get('/api/Invoice', function(err,req,resp,obj){
          assert.ifError(err);
          Inv_data = obj;
          resolve("Got Invoice");
        });
      }).then((status) => {
          console.log("status:", status);
          return new Promise((resolve, reject) => {
              client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                assert.ifError(err);
                PO_data =obj;
              // console.log(PO_data);
                resolve("Got PO");
              });
          }).then((status) => {
              console.log("status:", status);
              for(var i=0; i<Inv_data.length;i++){
                if(("resource:org.krungsri.factoring.User#"+sponsor) == Inv_data[i]['sponsor'] &&
                  ("resource:org.krungsri.factoring.User#"+supplier) == Inv_data[i]['supplier'] ){
                  var Invobj = Inv_data[i];
                  var respond = {
                    invoiceId: Invobj['invId'],
                    invoiceNumber: Invobj['invoiceNumber'],
                    invoiceDetail:  Invobj['detailInvoive'],
                    invoiceAmount:  Invobj['invoiceAmount'],
                    createdDate:  formatDate(Invobj['createDate']),
                    status:  Invobj['currentStatus']
                  };
                  respond.sponsor = Invobj['sponsor'].substring(Invobj['sponsor'].indexOf('#')+1);
                  respond.supplier = Invobj['supplier'].substring(Invobj['supplier'].indexOf('#')+1);
                  if(!!Invobj['updateDate']){
                        respond.updatedDate = formatDate(Invobj['updateDate']);
                  }
                  var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                  for(var j=0 ; j<PO_data.length;j++){
                      if(POID == PO_data[j]['poId']){
                        respond.poId = PO_data[j]['poId'];
                        respond.poNumber = PO_data[j]['poNumber'];
                        respond.poDetail = PO_data[j]['detail'];
                        respond.poAmount = PO_data[j]['poAmount'];
                      }
                  }                
                  respond_arr.push(respond);
                }
                  
              }
              res.json(respond_arr);
          })
      })
  }
 };

exports.list_FAC = function(req, res){
  var bank = (req.param('bank'));
  var supplier = (req.param('supplier'));

  if (!bank && !supplier){//list all PO
    var Inv_data;
    var PO_data;
    var Fac_data;
    var respond;
    var respond_arr = [];
    new Promise((resolve, reject) => {
        client.get('/api/FactoringReq', function(err,req,resp,obj){
          assert.ifError(err);
          Fac_data = obj;
          resolve("Got Factoring");
        });
    }).then((status) => {
        console.log("status:", status);
        return new Promise((resolve, reject) => {
            client.get('/api/Invoice', function(err,req,resp,obj){
              assert.ifError(err);
              Inv_data = obj;
              resolve("Got Invoice");
            });
        }).then((status) => {
                console.log("status:", status);
                return new Promise((resolve, reject) => {
                  client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                    assert.ifError(err);
                    PO_data =obj;
                    resolve("Got PO");
                  });
                }).then((status) => {
                  console.log("status:", status);
                  for(var h=0; h<Fac_data.length; h++){
                      var Facobj = Fac_data[h];
                      var respond = {
                        factoringId: Facobj['facId'],                      
                        requestedAmount:  Facobj['reqAmount'],
                        createdDate:  formatDate(Facobj['createDate']),
                        status:  Facobj['currentStatus'],
                        bank:  replaceAll(Facobj['bank'].substring(Facobj['bank'].indexOf('#')+1),"%20"," "),
                        sponsor:  replaceAll(Facobj['sponsor'].substring(Facobj['sponsor'].indexOf('#')+1),"%20"," "),
                        supplier:  replaceAll(Facobj['supplier'].substring(Facobj['supplier'].indexOf('#')+1),"%20"," ")
                      };
                      if(!!Facobj['updateDate']){
                        respond.updatedDate = formatDate(Facobj['updateDate']);
                      }
                      if(!!Facobj['approveAmount']){
                        respond.approvedAmount = Facobj['approveAmount'];
                      }
                      var InvID = Facobj['invId'].substring(Facobj['invId'].indexOf('#')+1);
                      for(var i=0; i<Inv_data.length;i++){
                        if(InvID == Inv_data[i]['invId']){
                          var Invobj = Inv_data[i];
                          respond.invoiceId = Invobj['invId'];
                          respond.invoiceNumber = Invobj['invoiceNumber'];
                          respond.invoiceDetail =  Invobj['detailInvoive'];
                          respond.invoiceAmount =  Invobj['invoiceAmount'];
                                                  
                          var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                          for(var j=0 ; j<PO_data.length;j++){
                              if(POID == PO_data[j]['poId']){
                                respond.poId = PO_data[j]['poId'];
                                respond.poNumber = PO_data[j]['poNumber'];
                                respond.poDetail = PO_data[j]['detail'];
                                respond.poAmount = PO_data[j]['poAmount'];
                              }
                          }                
                          respond_arr.push(respond);
                        }
                          
                      }
                    
                  }
                  res.json(respond_arr);
                })
        })
    })
  }else if(!bank){//filter by supplier
    var Inv_data;
    var PO_data;
    var Fac_data;
    var respond;
    var respond_arr = [];
    supplier = replaceAll(supplier," ","%20");
    new Promise((resolve, reject) => {
        client.get('/api/FactoringReq', function(err,req,resp,obj){
          assert.ifError(err);
          Fac_data = obj;
          resolve("Got Factoring");
        });
    }).then((status) => {
        console.log("status:", status);
        return new Promise((resolve, reject) => {
            client.get('/api/Invoice', function(err,req,resp,obj){
              assert.ifError(err);
              Inv_data = obj;
              resolve("Got Invoice");
            });
        }).then((status) => {
                console.log("status:", status);
                return new Promise((resolve, reject) => {
                  client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                    assert.ifError(err);
                    PO_data =obj;
                    resolve("Got PO");
                  });
                }).then((status) => {
                  console.log("status:", status);
                  for(var h=0; h<Fac_data.length; h++){
                    if(("resource:org.krungsri.factoring.User#"+supplier) == Fac_data[h]['supplier']){
                      var Facobj = Fac_data[h];
                      var respond = {
                        factoringId: Facobj['facId'],                      
                        requestedAmount:  Facobj['reqAmount'],
                        createdDate:  formatDate(Facobj['createDate']),
                        status:  Facobj['currentStatus'],
                        bank:  replaceAll(Facobj['bank'].substring(Facobj['bank'].indexOf('#')+1),"%20"," "),
                        sponsor:  replaceAll(Facobj['sponsor'].substring(Facobj['sponsor'].indexOf('#')+1),"%20"," "),
                        supplier:  replaceAll(Facobj['supplier'].substring(Facobj['supplier'].indexOf('#')+1),"%20"," ")
                      };
                      if(!!Facobj['updateDate']){
                        respond.updatedDate = formatDate(Facobj['updateDate']);
                      }
                      if(!!Facobj['approveAmount']){
                        respond.approvedAmount = Facobj['approveAmount'];
                      }
                      var InvID = Facobj['invId'].substring(Facobj['invId'].indexOf('#')+1);
                      for(var i=0; i<Inv_data.length;i++){
                        if(InvID == Inv_data[i]['invId']){
                          var Invobj = Inv_data[i];
                          respond.invoiceId = Invobj['invId'];
                          respond.invoiceNumber = Invobj['invoiceNumber'];
                          respond.invoiceDetail =  Invobj['detailInvoive'];
                          respond.invoiceAmount =  Invobj['invoiceAmount'];
                                                  
                          var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                          for(var j=0 ; j<PO_data.length;j++){
                              if(POID == PO_data[j]['poId']){
                                respond.poId = PO_data[j]['poId'];
                                respond.poNumber = PO_data[j]['poNumber'];
                                respond.poDetail = PO_data[j]['detail'];
                                respond.poAmount = PO_data[j]['poAmount'];
                              }
                          }                
                          respond_arr.push(respond);
                        }
                          
                      }
                    }
                  }
                  res.json(respond_arr);
                })
        })
    })
  }else if (!supplier){//filter by bank
    var Inv_data;
    var PO_data;
    var Fac_data;
    var respond;
    var respond_arr = [];
    bank = replaceAll(bank," ","%20");
    new Promise((resolve, reject) => {
        client.get('/api/FactoringReq', function(err,req,resp,obj){
          assert.ifError(err);
          Fac_data = obj;
          resolve("Got Factoring");
        });
    }).then((status) => {
        console.log("status:", status);
        return new Promise((resolve, reject) => {
            client.get('/api/Invoice', function(err,req,resp,obj){
              assert.ifError(err);
              Inv_data = obj;
              resolve("Got Invoice");
            });
        }).then((status) => {
                console.log("status:", status);
                return new Promise((resolve, reject) => {
                  client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                    assert.ifError(err);
                    PO_data =obj;
                    resolve("Got PO");
                  });
                }).then((status) => {
                  console.log("status:", status);
                  for(var h=0; h<Fac_data.length; h++){
                    if(("resource:org.krungsri.factoring.Bank#"+bank) == Fac_data[h]['bank']){
                      var Facobj = Fac_data[h];
                      var respond = {
                        factoringId: Facobj['facId'],                      
                        requestedAmount:  Facobj['reqAmount'],
                        createdDate:  formatDate(Facobj['createDate']),
                        status:  Facobj['currentStatus'],
                        bank:  replaceAll(Facobj['bank'].substring(Facobj['bank'].indexOf('#')+1),"%20"," "),
                        sponsor:  replaceAll(Facobj['sponsor'].substring(Facobj['sponsor'].indexOf('#')+1),"%20"," "),
                        supplier:  replaceAll(Facobj['supplier'].substring(Facobj['supplier'].indexOf('#')+1),"%20"," ")
                      };
                      if(!!Facobj['updateDate']){
                        respond.updatedDate = formatDate(Facobj['updateDate']);
                      }
                      if(!!Facobj['approveAmount']){
                        respond.approvedAmount = Facobj['approveAmount'];
                      }
                      var InvID = Facobj['invId'].substring(Facobj['invId'].indexOf('#')+1);
                      for(var i=0; i<Inv_data.length;i++){
                        if(InvID == Inv_data[i]['invId']){
                          var Invobj = Inv_data[i];
                          respond.invoiceId = Invobj['invId'];
                          respond.invoiceNumber = Invobj['invoiceNumber'];
                          respond.invoiceDetail =  Invobj['detailInvoive'];
                          respond.invoiceAmount =  Invobj['invoiceAmount'];
                                                  
                          var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                          for(var j=0 ; j<PO_data.length;j++){
                              if(POID == PO_data[j]['poId']){
                                respond.poId = PO_data[j]['poId'];
                                respond.poNumber = PO_data[j]['poNumber'];
                                respond.poDetail = PO_data[j]['detail'];
                                respond.poAmount = PO_data[j]['poAmount'];
                              }
                          }                
                          respond_arr.push(respond);
                        }
                          
                      }
                    }
                  }
                  res.json(respond_arr);
                })
        })
    })
  }else{// filter by bank and supplier
    var Inv_data;
    var PO_data;
    var Fac_data;
    var respond;
    var respond_arr = [];
    bank = replaceAll(bank," ","%20");
    supplier = replaceAll(supplier," ","%20");
    new Promise((resolve, reject) => {
        client.get('/api/FactoringReq', function(err,req,resp,obj){
          assert.ifError(err);
          Fac_data = obj;
          resolve("Got Factoring");
        });
    }).then((status) => {
        console.log("status:", status);
        return new Promise((resolve, reject) => {
            client.get('/api/Invoice', function(err,req,resp,obj){
              assert.ifError(err);
              Inv_data = obj;
              resolve("Got Invoice");
            });
        }).then((status) => {
                console.log("status:", status);
                return new Promise((resolve, reject) => {
                  client.get('/api/PurchaseOrder', function(err,req,resp,obj){
                    assert.ifError(err);
                    PO_data =obj;
                    resolve("Got PO");
                  });
                }).then((status) => {
                  console.log("status:", status);
                  for(var h=0; h<Fac_data.length; h++){
                    if(("resource:org.krungsri.factoring.Bank#"+bank) == Fac_data[h]['bank'] &&
                        ("resource:org.krungsri.factoring.User#"+supplier) == Fac_data[h]['supplier']){
                      var Facobj = Fac_data[h];
                      var respond = {
                        factoringId: Facobj['facId'],                      
                        requestedAmount:  Facobj['reqAmount'],
                        createdDate:  formatDate(Facobj['createDate']),
                        status:  Facobj['currentStatus'],
                        bank:  Facobj['bank'].substring(Facobj['bank'].indexOf('#')+1),
                        sponsor:  Facobj['sponsor'].substring(Facobj['sponsor'].indexOf('#')+1),
                        supplier:  Facobj['supplier'].substring(Facobj['supplier'].indexOf('#')+1)
                      };
                      if(!!Facobj['updateDate']){
                        respond.updatedDate = formatDate(Facobj['updateDate']);
                      }
                      if(!!Facobj['approveAmount']){
                        respond.approvedAmount = Facobj['approveAmount'];
                      }
                      var InvID = Facobj['invId'].substring(Facobj['invId'].indexOf('#')+1);
                      for(var i=0; i<Inv_data.length;i++){
                        if(InvID == Inv_data[i]['invId']){
                          var Invobj = Inv_data[i];
                          respond.invoiceId = Invobj['invId'];
                          respond.invoiceNumber = Invobj['invoiceNumber'];
                          respond.invoiceDetail =  Invobj['detailInvoive'];
                          respond.invoiceAmount =  Invobj['invoiceAmount'];
                                                  
                          var POID = Invobj['poId'].substring(Invobj['poId'].indexOf('#')+1);
                          for(var j=0 ; j<PO_data.length;j++){
                              if(POID == PO_data[j]['poId']){
                                respond.poId = PO_data[j]['poId'];
                                respond.poNumber = PO_data[j]['poNumber'];
                                respond.poDetail = PO_data[j]['detail'];
                                respond.poAmount = PO_data[j]['poAmount'];
                              }
                          }                
                          respond_arr.push(respond);
                        }
                          
                      }
                    }
                  }
                  res.json(respond_arr);
                })
        })
    })
  }
 }; 
exports.approve_PO = function(req, res) {
  
   var POID = req.body["poId"];

   var request = {
     $class: "org.krungsri.factoring.ApprovePO",
     PurchaseOrder: POID,
     updateDate: Date.now()
   };

   var respond;   
   client.post('/api/ApprovePO', request, function(err, req, resp, data) {
     if(err){
       res.status(err.body.error.statusCode || 500).json(err.body);
       return;
     }
     respond = {
       statusCode: resp.statusCode,
       headers: resp.headers,
       body: data
     };
     res.json(respond);
   });
   
 };
exports.approve_INV = function(req, res) {
  
   var InvId = req.body["invoiceId"];

   var request = {
     $class: "org.krungsri.factoring.ApproveInvoice",
     Invoice: InvId,
     updateDate: Date.now()
   };
   console.log(request);
   var respond;   
   client.post('/api/ApproveInvoice', request, function(err, req, resp, data) {
     if(err){
       res.status(err.body.error.statusCode || 500).json(err.body);
       return;
     }
     respond = {
       statusCode: resp.statusCode,
       headers: resp.headers,
       body: data
     };
     res.json(respond);
   });
   
 };
exports.approve_FAC = function(req, res) {
  
   var FacId = req.body["factoringId"];
   var amount = req.body["approvedAmount"];

   var request = {
     $class: "org.krungsri.factoring.ApproveFactoring",
     FactoringReq: FacId,
     approveAmount: amount,
     updateDate: Date.now()
   };

   var respond;   
   client.post('/api/ApproveFactoring', request, function(err, req, resp, data) {
     if(err){
       res.status(err.body.error.statusCode || 500).json(err.body);
       return;
     }
     respond = {
       statusCode: resp.statusCode,
       headers: resp.headers,
       body: data
     };
     res.json(respond);
   });
   
 };
exports.register_PO = function(req, res) {
  console.log("Register PO");
   var POID = req.body["poNumber"];
   var sponsor = req.body["sponsor"];
   var supplier = req.body["supplier"];
   var detail = req.body["detail"];
   var amount = req.body["price"];
   var request = {
     $class: "org.krungsri.factoring.RequestPO",
     poId: POID,
     poNumber: POID,
     createDate: Date.now(),
     detail: detail,
     poAmount: amount,
     sponsor: sponsor,
     supplier: supplier
   };
   console.log(request);
   var respond;   
   client.post('/api/RequestPO', request, function(err, req, resp, data) {
     if(err){
       res.status(err.body.error.statusCode || 500).json(err.body);
       return;
     }
     respond = {
       statusCode: resp.statusCode,
       headers: resp.headers,
       body: data
     };
     res.json(respond);
     console.log("register PO complete");
     console.log(respond);
   });
   
 };
exports.register_INV = function(req, res) {
  
   var InvNumber = req.body["invoiceNumber"];
   var POID = req.body["poId"];
   var sponsor = req.body["sponsor"];
   var supplier = req.body["supplier"];
   var detail = req.body["detail"];
   var amount = req.body["invoiceAmount"];
   var request = {
     $class: "org.krungsri.factoring.RequestInvoice",
     invId: InvNumber,
     invoiceNumber: InvNumber,
     createDate: Date.now(),
     detailInvoive: detail,
     invoiceAmount: amount,
     poId: POID,
     sponsor: sponsor,
     supplier: supplier
   };
  
   var respond;   
   client.post('/api/RequestInvoice', request, function(err, req, resp, data) {
     if(err){
       res.status(err.body.error.statusCode || 500).json(err.body);
       return;
     }
     respond = {
       statusCode: resp.statusCode,
       headers: resp.headers,
       body: data
     };
     res.json(respond);
   });
   
 };
exports.register_FAC = function(req, res) {
  
   var InvId = req.body["invoiceId"];
   var InvNumber = req.body["invoiceNumber"];
   var sponsor = req.body["sponsor"];
   var bank = req.body["bank"];
   var amount = req.body["requestedAmount"];
 console.log("invoice ID = " + InvId);
   new Promise((resolve, reject) => {
    client.get('/api/Invoice/'+InvId, function(err,req,resp,obj){
      assert.ifError(err);
      
      var request = {
        $class: "org.krungsri.factoring.RequestFactoring",
        invId: InvId,
        facId: "factoring_"+InvId,
        createDate: Date.now(),
        reqAmount: amount,
        sponsor: sponsor,
        supplier: obj['supplier'],
        bank: bank
      };
      
      resolve(request);
    });
  }).then((request) => {
      console.log("status:", request);
      return new Promise((resolve, reject) => {
        var respond;   
        client.post('/api/RequestFactoring', request, function(err, req, resp, data) {
          if(err){
            res.status(err.body.error.statusCode || 500).json(err.body);
            return;
          }
          respond = {
            statusCode: resp.statusCode,
            headers: resp.headers,
            body: data
          };
          res.json(respond);
        });
  })});
   
   
   
   
 };
exports.register_bank = function(req, res) {
   
    var BankID = req.body["bankId"];
    var BankName = req.body["bankName"];

    var request = {
      $class: "org.krungsri.factoring.Bank",
      bankId: BankID,
      bankName: BankName
    };
    var respond;
    
    client.post('/api/Bank', request, function(err, req, resp, data) {
      if(err){
        res.status(err.body.error.statusCode || 500).json(err.body);
        return;
      }
      respond = {
        statusCode: resp.statusCode,
        headers: resp.headers,
        body: data
      };
      res.json(respond);
    });
    
  };

function AdjustPO(obj){
  var temp = obj;
  var respond;
  var respond_arr = [];
  for(var i=0; i<temp.length;i++)
  {
    respond = {
      poId: temp[i]['poId'],
      poNumber: temp[i]['poNumber'],
      detail:  temp[i]['detail'],
      price:  temp[i]['poAmount'],
      createDate:  formatDate(temp[i]['createDate']),
      status:  temp[i]['currentStatus']
    };
    respond.sponsor = replaceAll(temp[i]['sponsor'].substring(temp[i]['sponsor'].indexOf('#')+1),"%20"," ");
    respond.supplier = replaceAll(temp[i]['supplier'].substring(temp[i]['supplier'].indexOf('#')+1),"%20"," ");
    if(!!temp[i]['updateDate']){
      respond.updatedDate = temp[i]['updateDate'];
    }
    respond_arr.push(respond);
    
  }
  console.log(respond_arr);
  return respond_arr;
 }
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
function formatDate(pDate){
    var strDate;
    var d,m,y;
    var date = new Date(pDate);
    d = date.getDate().toString();
    m = date.getMonth().toString();
    y = date.getFullYear().toString();
    strDate = d.padStart(2,"0") + "/" + m.padStart(2,"0") + "/" + y;
    
    return strDate;
}