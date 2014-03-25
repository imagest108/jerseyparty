/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var statusIndex;
var isBlinking = false;
var isPartyTime = false;
var listItem;
var i = 1;
var drawSearchingLight;
var nextClass;
var tempClass;

var currentValue = "";

var app = {
    // Application Constructor
    initialize: function() 
    {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() 
    {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() 
    {
        app.receivedEvent('deviceready');
        app.setupBluetooth();
        app.displaySearchingMode();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) 
    {
        console.log('Received Event: ' + id);
    },

    displaySearchingMode: function(){
      
      $("body").addClass("png1");
      var fps = 5;
      drawSearchingLight = setInterval(animation,200);
      function animation(){
          if(i >= 12)
          {
           i = 0;
           $("body").removeClass("png12");
          }
          tempClass = "png"+i;
          i++;
          nextClass = "png"+i;
          $("body").addClass(nextClass).removeClass(tempClass); 
          //console.log("nextClass: "+nextClass);
          //var currentClassName = $("body").attr("class");
          //console.log("current Class is : "+currentClassName);
      }
      // drawSearchingLight = function() 
      // {
      //   setTimeout(function() {
      //     requestAnimationFrame(drawSearchingLight);
      //     // Drawing code goes here
      //     if(i >= 12)
      //     {
      //      i = 0;
      //      $("body").removeClass("png12");
      //     }
      //     var tempClass = "png"+i;
      //     i++;
      //     var nextClass = "png"+i;
      //     $("body").addClass(nextClass).removeClass(tempClass); 
      //     //console.log("nextClass: "+nextClass);
      //     var currentClassName = $("body").attr("class");
      //     //console.log("current Class is : "+currentClassName);
      //   },1000/fps);
      // }
      // drawSearchingLight();

    },

    displayInstruction: function()
    {
        $("#png").html("");
        $("body").removeClass(nextClass);    
        clearInterval(drawSearchingLight);
        //display instruction pages;
        $("body").toggleClass("instruction");
        var animationTimer = setInterval(animation,500);
        function animation()
        {
          $("body").toggleClass("secondstep");
        }
        var startTimer = setTimeout(app.startParty,5000);
    },

    startParty: function()
    {
        //app.clear();
        //app.display("Let's start a party!");
        app.watchAcceleration();
        isPartyTime = true;
        var startTimer = setTimeout(app.watchLightStatus,2000);
    },

    display: function(message) 
    {
        var label = document.createTextNode(message),
        lineBreak = document.createElement("br");
        messageDiv.appendChild(lineBreak);          // add a line break
        messageDiv.appendChild(label);              // add the text    
        var displayTimeout = setTimeout(app.clear, 4000);
    },

    clear: function() 
    {
        messageDiv.innerHTML = "";
    },
   
   //**************** Turn on & off the lights!! **************//  
    watchLightStatus: function()
    {
        app.clear();
        
        console.log("Watch light status for every second");
        watchTimer = setInterval(checkCurrentStatus, 0);

        $("body").removeClass("instruction").addClass("showtime");
                
        function checkCurrentStatus()
        {
            //console.log("checkCurrentStatus/ currentValue :"+currentValue);
            //console.log("checkCurrentStatus/ blinkingStatus :"+isBlinking);
            if(currentValue == "AQ==" && isBlinking == true)
            {
                //console.log("@@@@@@@@@@@@@@@ Turn Off @@@@@@@@@@@@@@@");
                $("body").toggleClass("blink");
                bluetoothle.write(writeSuccess, writeError, {"value":"AA==","serviceAssignedNumber":"ff10","characteristicAssignedNumber":"ff11"});
                //console.log("it's blinking!");
                //isBlinking = false;
                currentValue = "AA==";  
            }
            else if(currentValue == "AA==" && isBlinking == false)
            {
                //console.log("@@@@@@@@@@@@@@@ Turn On @@@@@@@@@@@@@@@");
                $("body").toggleClass("blink");
                
                bluetoothle.write(writeSuccess, writeError, {"value":"AQ==","serviceAssignedNumber":"ff10","characteristicAssignedNumber":"ff11"});
                //console.log("it's blinking!");
                currentValue = "AQ==";
            }
        }

        function writeSuccess(obj)
        {
            if(obj.status == "written")
            {
                //console.log("it's success!!");
                // Make a vibration! 

            }
            else
            {
                console.log("Unexpected write status: " + obj.status);
                disconnectDevice();    
            }
        }

        function writeError(obj)
        {
            console.log("write error: " + obj.error + " - " + obj.message);
            disconnectDevice();
        }
    },

    //**************** Accelerator Monitoring **************//  
    watchAcceleration: function() 
    {
        function success(acceleration) 
        {
            //console.log("App is watching acceleration");
            if(isPartyTime)
            {
                if(acceleration.x > 4) isBlinking = true;
                else if(acceleration.x < 4)isBlinking = false;
            }else{
                console.log("It's not the party time yet!");
            }
        }

        function failure(error) 
        {
            // if the accelerometer fails, display the error:
            app.display('Accelerometer error');
            app.display(error);
        }

        // taceh the accelerometer every 100ms: 
        var watchAccel = navigator.accelerometer.watchAcceleration(success, failure, {
            frequency: 10
        });
    },

    //**************** bluetoothLE functions**************//
    setupBluetooth: function()
    {

        var addressKey = "adress";

        var heartRateServiceAssignedNumber = "ff10";
        var heartRateMeasurementCharacteristicAssignedNumber = "ff11";

        var scanTimer = null;
        var connectTimer = null;
        var reconnectTimer = null;

        var iOSPlatform = "iOS";
        var androidPlatform = "Android";
        
        bluetoothle.initialize(initializeSuccess, initializeError);

        function initializeSuccess(obj)
        {
         if (obj.status == "initialized")
          {
             
            // var address = window.localStorage.getItem(addressKey);
            // if (address == null)
            // {
            //     console.log("Bluetooth initialized successfully, starting scan for heart rate devices.");
            //     var paramsObj = {"serviceAssignedNumbers":[heartRateServiceAssignedNumber]};
            //     bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
            // }
            // else
            // {
            //     app.display("Connecting....");
            //     connectDevice(address);
      
            // }
            
                console.log("Bluetooth initialized successfully, starting scan for heart rate devices.");
                var paramsObj = {"serviceAssignedNumbers":[heartRateServiceAssignedNumber]};
                bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);

          }
          else
          {
            console.log("Unexpected initialize status: " + obj.status);
          }
        }

        function initializeError(obj)
        {
          console.log("Initialize error: " + obj.error + " - " + obj.message);
        }

        function startScanSuccess(obj)
        {
          if (obj.status == "scanResult")
          {
            console.log("Stopping scan..");
            bluetoothle.stopScan(stopScanSuccess, stopScanError);
            clearScanTimeout();

            window.localStorage.setItem(addressKey, obj.address);
            connectDevice(obj.address);

            // listItem = document.createElement('li');
            // listItem.className = "topcoat-list__item";
            // listItem.setAttribute('deviceId', obj.address); 
            // listItem.innerHTML = obj.name + "<br/><i>" + obj.address + "</i>";
            // deviceList.appendChild(listItem);       
          }
          else if (obj.status == "scanStarted")
          {
            console.log("Scan was started successfully, stopping in 10");
            //scanTimer = setTimeout(scanTimeout, 10000);
          }
          else
          {
            console.log("Unexpected start scan status: " + obj.status);
          }
        }

        function startScanError(obj)
        {
          console.log("Start scan error: " + obj.error + " - " + obj.message);
        }

        function scanTimeout()
        {
          console.log("Scanning time out, stopping");
          bluetoothle.stopScan(stopScanSuccess, stopScanError);
        }

        function clearScanTimeout()
        { 
            console.log("Clearing scanning timeout");
          if (scanTimer !== null)
          {
            clearTimeout(scanTimer);
          }
        }

        function stopScanSuccess(obj)
        {
          if (obj.status == "scanStopped")
          {
            console.log("Scan was stopped successfully");
          }
          else
          {
            console.log("Unexpected stop scan status: " + obj.status);
          }
        }

        function stopScanError(obj)
        {
          console.log("Stop scan error: " + obj.error + " - " + obj.message);
        }

        function connectDevice(address)
        {
          console.log("Begining connection to: " + address + " with 5 second timeout");
            var paramsObj = {"address":address};
          bluetoothle.connect(connectSuccess, connectError, paramsObj);
          connectTimer = setTimeout(connectTimeout, 5000);
        }

        function connectSuccess(obj)
        {
          if (obj.status == "connected")
          {
            console.log("Connected to : " + obj.name + " - " + obj.address);

            clearConnectTimeout();

            if (window.device.platform == iOSPlatform)
            {
              console.log("Discovering heart rate service");
              var paramsObj = {"serviceAssignedNumbers":[heartRateServiceAssignedNumber]};
              bluetoothle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
              
              //app.clear();
              //app.display("Light connected.");
  
            }
            else if (window.device.platform == androidPlatform)
            {
              console.log("Beginning discovery");
              bluetoothle.discover(discoverSuccess, discoverError);
            }

          }
          else if (obj.status == "connecting")
          {
            //app.clear();
            //app.display("Connecting....");
            console.log("Connecting to : " + obj.name + " - " + obj.address);
          }
            else
          {
            console.log("Unexpected connect status: " + obj.status);
            clearConnectTimeout();
          }
        }

        function connectError(obj)
        {
          console.log("Connect error: " + obj.error + " - " + obj.message);
          clearConnectTimeout();
        }

        function connectTimeout()
        {
          console.log("Connection timed out");
        }

        function clearConnectTimeout()
        { 
            console.log("Clearing connect timeout");
          if (connectTimer !== null)
          {
            clearTimeout(connectTimer);
          }
        }
        function servicesHeartSuccess(obj)
        {
          if (obj.status == "discoveredServices")
          {
            var serviceAssignedNumbers = obj.serviceAssignedNumbers;
            for (var i = 0; i < serviceAssignedNumbers.length; i++)
            {
              var serviceAssignedNumber = serviceAssignedNumbers[i];
              console.log("D: "+serviceAssignedNumber);
              console.log("D2: "+heartRateServiceAssignedNumber);
              if (serviceAssignedNumber == heartRateServiceAssignedNumber)
              {
                console.log("Finding heart rate characteristics");
                var paramsObj = {"serviceAssignedNumber":heartRateServiceAssignedNumber, "characteristicAssignedNumbers":[heartRateMeasurementCharacteristicAssignedNumber]};
                bluetoothle.characteristics(characteristicsHeartSuccess, characteristicsHeartError, paramsObj);
                return;
              }
            }
            console.log("Error: heart rate service not found");
          }
            else
          {
            console.log("Unexpected services heart status: " + obj.status);
          }
          disconnectDevice();
        }

        function servicesHeartError(obj)
        {
          console.log("Services heart error: " + obj.error + " - " + obj.message);
          disconnectDevice();
        }

        function characteristicsHeartSuccess(obj)
        {
          if (obj.status == "discoveredCharacteristics")
          {
            var characteristicAssignedNumbers = obj.characteristicAssignedNumbers;
            for (var i = 0; i < characteristicAssignedNumbers.length; i++)
            {
              console.log("Heart characteristics found");
              var characteristicAssignedNumber = characteristicAssignedNumbers[i];

              if (characteristicAssignedNumber == heartRateMeasurementCharacteristicAssignedNumber)
              {
                var paramsObj = {"serviceAssignedNumber":heartRateServiceAssignedNumber, "characteristicAssignedNumber":heartRateMeasurementCharacteristicAssignedNumber};
                bluetoothle.read(readSuccess, readError, paramsObj);

                return;
              }
            }
            console.log("Error: Heart rate measurement characteristic not found.");
          }
            else
          {
            console.log("Unexpected characteristics heart status: " + obj.status);
          }
        }

        function characteristicsHeartError(obj)
        {
          console.log("Characteristics heart error: " + obj.error + " - " + obj.message);
          disconnectDevice();
        }

        function discoverSuccess(obj)
        {
          if (obj.status == "discovered")
          {
                console.log("Discovery completed");
          }
          else
          {
            console.log("Unexpected discover status: " + obj.status);
            disconnectDevice();
          }
        }

        function discoverError(obj)
        {
          console.log("Discover error: " + obj.error + " - " + obj.message);
          disconnectDevice();
        }
        function readSuccess(obj)
        {
            if (obj.status == "read")
            {
                console.log(obj.serviceAssignedNumber);    
                console.log("Original read value: "+obj.value);    
                currentValue = obj.value;
                $("#png").html("<img src='img/Text_Connected.png' />");
                var instructionTimer = setTimeout(app.displayInstruction, 1000);       
            }
            else
            {
                console.log("Unexpected read status: " + obj.status);
                disconnectDevice();
            }
        }
        
        function readError(obj)
        {
          console.log("Read error: " + obj.error + " - " + obj.message);
          disconnectDevice();
        }
        function disconnectDevice()
        {
          bluetoothle.disconnect(disconnectSuccess, disconnectError);
        }

        function disconnectSuccess(obj)
        {
            if (obj.status == "disconnected")
            {
                console.log("Disconnect device");
                //app.display("Disconnected");

                closeDevice();
            }
            else if (obj.status == "disconnecting")
            {
                console.log("Disconnecting device");
            }
            else
          {
            console.log("Unexpected disconnect status: " + obj.status);
          }
        }

        function disconnectError(obj)
        {
          console.log("Disconnect error: " + obj.error + " - " + obj.message);
        }

        function closeDevice()
        {
          bluetoothle.close(closeSuccess, closeError);
        }

        function closeSuccess(obj)
        {
            if (obj.status == "closed")
            {
                console.log("Closed device");
            }
            else
          {
            console.log("Unexpected close status: " + obj.status);
          }
        }

        function closeError(obj)
        {
          console.log("Close error: " + obj.error + " - " + obj.message);
        }
    }
};
