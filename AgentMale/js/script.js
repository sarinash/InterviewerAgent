  (function(window) {
    var Talked;
    
    //var audio1 = new Audio('type_between_1.mp3');
    var StartingAudio = new Audio('../sounds/Starting.mp3');
    var Q1Audio = new Audio('../sounds/Q1.mp3');
    var Q2Audio = new Audio('../sounds/Q2.mp3');
    var Q3Audio = new Audio('../sounds/Q3.mp3');
    var Q4Audio = new Audio('../sounds/Q4.mp3');
    var Q5Audio = new Audio('../sounds/Q5.mp3');
    var Q1SAudio = new Audio('../sounds/Q1S.mp3');
    var Q2SAudio = new Audio('../sounds/Q2S.mp3');
    var Q3SAudio = new Audio('../sounds/Q3S.mp3');
    var Q4SAudio = new Audio('../sounds/Q4S.mp3');
    var Q5SAudio = new Audio('../sounds/Q5S.mp3');
    var SorryAudio = new Audio("../sounds/Sorry.mp3");
    var EndAudio = new Audio('../sounds/Ending.mp3');
    var Typing1 = new Audio("../sounds/type_between_1.mp3");
    var Typing2 = new Audio("../sounds/type_between_2.mp3");
    var Typing3 = new Audio("../sounds/type_end_1.mp3");
    var Q1;
    var Q2;
    var Q3;
    var Q4;
    var Q5;
    var NonVerbal;
    var VarEnd;
    var VarStarting;
    var VarBefore;
    var Q1S;
    var Q2S; 
    var Q3S;
    var Q4S;
    var Q5S; 
    var Sorry;  
    var downloadVar;

    var Time = 0;
    var  Before = document.getElementById('Before')
    var  Zero= document.getElementById('Start')
    var  One = document.getElementById('Q1')
    var  Two = document.getElementById('Q2')
    var  Three = document.getElementById('Q3')
    var  Four = document.getElementById('Q4')
    var  Five = document.getElementById('Q5')
    var  Smile1 = document.getElementById('S1')
    var  Smile2 = document.getElementById('S2')
    var  BlinkHead = document.getElementById('BH')
    var  BlinkHead2 = document.getElementById("BH1")
    var  HeadBlink = document.getElementById('HB')
    var  Head3 = document.getElementById('BHHH')
    var  Wrinkle= document.getElementById('Wrinkle')
    var  WrinkleB = document.getElementById('WrinkleB')
    var  End = document.getElementById('End')
    var  OneS = document.getElementById('Q1S')
    var  TwoS = document.getElementById('Q2S')
    var  ThreeS = document.getElementById('Q3S')
    var  FourS = document.getElementById('Q4S')
    var  FiveS = document.getElementById('Q5S')
    var  SorryGif = document.getElementById('Sorry') 
    

    

    
    //function random
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    Gifs = [Smile1, Smile2, BlinkHead, HeadBlink, Head3, BlinkHead, HeadBlink, Head3, BlinkHead2, BlinkHead2]
    GifsWait = [Wrinkle, WrinkleB]

//////////////////////VAD////////////////////////////////////
  
    document.getElementById("btnn").addEventListener("click", function(){      
      
      var x = document.getElementById("StartButton");
      if(x.style.display==="none"){
        x.style.display="block";
      }else{
        
        x.style.display="none";
        var VAD = function(options) { 
        

        // Default options
        this.options = {
          fftSize: 512,
          bufferLen: 512, 
          voice_stop: function() {},
          voice_start: function() {},
          smoothingTimeConstant: 0.99, 
          energy_offset: 1e-8, // The initial offset.
          energy_threshold_ratio_pos: 2, // Signal must be twice the offset
          energy_threshold_ratio_neg: 0.5, // Signal must be half the offset
          energy_integration: 1, // Size of integration change compared to the signal per second.
          filter: [
            {f: 200, v:0}, // 0 -> 200 is 0
            {f: 2000, v:1} // 200 -> 2k is 1
          ],
          source: null,
          context: null
        };
    
        // User options
        for(var option in options) {
          if(options.hasOwnProperty(option)) {
            this.options[option] = options[option];
          }
        }
    
        // Require source
       if(!this.options.source)
         throw new Error("The options must specify a MediaStreamAudioSourceNode.");
    
        // Set this.options.context
        this.options.context = this.options.source.context;
    
        // Calculate time relationships
        this.hertzPerBin = this.options.context.sampleRate / this.options.fftSize;
        this.iterationFrequency = this.options.context.sampleRate / this.options.bufferLen;
        this.iterationPeriod = 1 / this.iterationFrequency;
    
        var DEBUG = true;
        if(DEBUG) console.log(
          'Vad' +
          ' | sampleRate: ' + this.options.context.sampleRate +
          ' | hertzPerBin: ' + this.hertzPerBin +
          ' | iterationFrequency: ' + this.iterationFrequency +
          ' | iterationPeriod: ' + this.iterationPeriod
        );
    
        this.setFilter = function(shape) {
          this.filter = [];
          for(var i = 0, iLen = this.options.fftSize / 2; i < iLen; i++) {
            this.filter[i] = 0;
            for(var j = 0, jLen = shape.length; j < jLen; j++) {
              if(i * this.hertzPerBin < shape[j].f) {
                this.filter[i] = shape[j].v;
                break; // Exit j loop
              }
            }
          }
        }
    
        this.setFilter(this.options.filter);
    
        this.ready = {};
        this.vadState = false; // True when Voice Activity Detected
    
        // Energy detector props
        this.energy_offset = this.options.energy_offset;
        this.energy_threshold_pos = this.energy_offset * this.options.energy_threshold_ratio_pos;
        this.energy_threshold_neg = this.energy_offset * this.options.energy_threshold_ratio_neg;
    
        this.voiceTrend = 0;
        this.voiceTrendMax = 10;
        this.voiceTrendMin = -10;
        this.voiceTrendStart = 5;
        this.voiceTrendEnd = -5;
    
        // Create analyser 
        this.analyser = this.options.context.createAnalyser();
        this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant; // 0.99;
        this.analyser.fftSize = this.options.fftSize;
    
        this.floatFrequencyData = new Float32Array(this.analyser.frequencyBinCount);
    
        // Setup local storage of the Linear FFT data
        this.floatFrequencyDataLinear = new Float32Array(this.floatFrequencyData.length);
    
        // Connect this.analyser
        this.options.source.connect(this.analyser); 
    
        // Create ScriptProcessorNode
        this.scriptProcessorNode = this.options.context.createScriptProcessor(this.options.bufferLen, 1, 1);
    
        // Connect scriptProcessorNode (Theretically, not required)
        this.scriptProcessorNode.connect(this.options.context.destination);
    
        // Create callback to update/analyze floatFrequencyData
        var self = this;
        this.scriptProcessorNode.onaudioprocess = function(event) {
          self.analyser.getFloatFrequencyData(self.floatFrequencyData);
          self.update();
          self.monitor();
        };
    
        // Connect scriptProcessorNode
        this.options.source.connect(this.scriptProcessorNode);
    
        // log stuff
        this.logging = false;
        this.log_i = 0;
        this.log_limit = 100;
    
        this.triggerLog = function(limit) {
          this.logging = true;
          this.log_i = 0;
          this.log_limit = typeof limit === 'number' ? limit : this.log_limit;
        }
    
        this.log = function(msg) {
          if(this.logging && this.log_i < this.log_limit) {
            this.log_i++;
            console.log(msg);
          } else {
            this.logging = false;
          }
        }
    
        this.update = function() {
          // Update the local version of the Linear FFT
          var fft = this.floatFrequencyData;
          for(var i = 0, iLen = fft.length; i < iLen; i++) {
            this.floatFrequencyDataLinear[i] = Math.pow(10, fft[i] / 10);
          }
          this.ready = {};
        }
    
        this.getEnergy = function() {
          if(this.ready.energy) {
            return this.energy;
          }
    
          var energy = 0;
          var fft = this.floatFrequencyDataLinear;
    
          for(var i = 0, iLen = fft.length; i < iLen; i++) {
            energy += this.filter[i] * fft[i] * fft[i];
          }
    
          this.energy = energy;
          this.ready.energy = true;
          
    
          return energy;
        }
    
        this.monitor = function() {
          var energy = this.getEnergy();
          var signal = energy - this.energy_offset;
    
          if(signal > this.energy_threshold_pos) {
            this.voiceTrend = (this.voiceTrend + 1 > this.voiceTrendMax) ? this.voiceTrendMax : this.voiceTrend + 1;
          } else if(signal < -this.energy_threshold_neg) {
            this.voiceTrend = (this.voiceTrend - 1 < this.voiceTrendMin) ? this.voiceTrendMin : this.voiceTrend - 1;
          } else {
            // voiceTrend gets smaller
            if(this.voiceTrend > 0) {
                
              this.voiceTrend--;
            } else if(this.voiceTrend < 0) {
              this.voiceTrend++;
            }
          }
    
          var start = false, end = false;
          if(this.voiceTrend > this.voiceTrendStart) {
            // Start of speech detected
            start = true;
          } else if(this.voiceTrend < this.voiceTrendEnd) {
            // End of speech detected
            end = true;
          }
    
          // Integration brings in the real-time aspect through the relationship with the frequency this functions is called.
          var integration = signal * this.iterationPeriod * this.options.energy_integration;
    
          // Idea?: The integration is affected by the voiceTrend magnitude? - Not sure. Not doing atm.
    
          // The !end limits the offset delta boost till after the end is detected.
          if(integration > 0 || !end) {
            this.energy_offset += integration;
          } else {
            this.energy_offset += integration * 10;
          }
          this.energy_offset = this.energy_offset < 0 ? 0 : this.energy_offset;
          this.energy_threshold_pos = this.energy_offset * this.options.energy_threshold_ratio_pos;
          this.energy_threshold_neg = this.energy_offset * this.options.energy_threshold_ratio_neg;
          // Broadcast the messages
          if(start && !this.vadState) {
            this.vadState = true;
            this.options.voice_start();
            //console.log(this.energy);
              if(this.energy > 0.00000000001) {
                  Talked = 1;
                  //console.log("ok");
                  if (Speak.length < 4){
                      console.log("loading");
                  }
              }
            
          }
          if(end && this.vadState) {
            this.vadState = false;
            this.options.voice_stop();
            Talked = 0;
          }
    
          this.log(
            'e: ' + energy +
            ' | e_of: ' + this.energy_offset +
            ' | e+_th: ' + this.energy_threshold_pos +
            ' | e-_th: ' + this.energy_threshold_neg +
            ' | signal: ' + signal +
            ' | int: ' + integration +
            ' | voiceTrend: ' + this.voiceTrend +
            ' | start: ' + start +
            ' | end: ' + end
          );    
          return signal;
        }
      };    
      window.VAD = VAD;          
      }
    }); 
//////////////////////VAD////////////////////////////////////
    var NonverbalAction = []
    var Speak=[];
    var Lag = 10;
    function myTimer() {
      Time = Time + 1;
      if (Time < Lag){
        console.log(Time,"Before the start");
        Speak = [];
      }else{ 
        if (Talked == 1){
          Speak.push(1);
          console.log("Talked")
        }else{
          Speak.push(0);
        } 
        //console.log(speak.slice(speak.length-7, speak.length))
      }
    } 
    var myVar = setInterval(myTimer, 1000);

    //Scenes for Nonverbal behaviours

    function NonverbalFunction() {
      
      var d = new Date();
      var t = d.toLocaleTimeString();
      NonverbalAction.push(t); 
      //console.log(t);
      
      Last_5seconds_Spoke =Speak.slice(Speak.length-5, Speak.length)
      console.log(Last_5seconds_Spoke);
      var Sum_Last_5seconds_Spoke = Last_5seconds_Spoke.reduce((a, b) => a + b, 0);
      if (Sum_Last_5seconds_Spoke >= 1){     
        console.log(Random_Non_Verbal = getRandomInt(9));        
        if (Emotion == "happy"){
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile2.style.opacity = 1;
          Smile1.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead.style.opacity = 0;
          BlinkHead2.style.opacity = 0;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0; 
          NonverbalAction.push(1);
            
        }else if (Random_Non_Verbal==0 ||Random_Non_Verbal==1||Random_Non_Verbal==2 ||Random_Non_Verbal==5){
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile1.style.opacity = 0;
          Smile2.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead.style.opacity = 1;
          BlinkHead2.style.opacity = 0;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0; 
          NonverbalAction.push(2);
                       
        } else if (Random_Non_Verbal==3 ||Random_Non_Verbal==6){
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile1.style.opacity = 0;
          Smile2.style.opacity = 0;
          HeadBlink.style.opacity = 1;
          BlinkHead.style.opacity = 0;
          BlinkHead2.style.opacity = 0;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0; 
          NonverbalAction.push(3);
                       
        }else if (Random_Non_Verbal==4 ||Random_Non_Verbal==7){
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile1.style.opacity = 0;
          Smile2.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead.style.opacity = 0;
          BlinkHead2.style.opacity = 0;
          Head3.style.opacity = 1;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0; 
          NonverbalAction.push(4);  
                   
        } else {
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile1.style.opacity = 0;
          Smile2.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead.style.opacity = 0;
          BlinkHead2.style.opacity = 1;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0;  
          NonverbalAction.push(5);
          Typing1.play();
          
        }
      }else{        
        console.log(Random_Non_Verbal_Wrinkle = getRandomInt(2));
                
        if (Emotion == "happy"){
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile2.style.opacity = 1;
          Smile1.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead.style.opacity = 0;
          BlinkHead2.style.opacity = 0;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0; 
          NonverbalAction.push(1);
            
        }else if (Random_Non_Verbal_Wrinkle==1){
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile1.style.opacity = 0;
          Smile2.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead.style.opacity = 0;
          BlinkHead2.style.opacity = 0;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 1;
          WrinkleB.style.opacity = 0;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0;  
          NonverbalAction.push(6);          
        } else{     
          Before.style.opacity = 0;
          Zero.style.opacity = 0;
          One.style.opacity = 0;
          Two.style.opacity = 0;
          Three.style.opacity = 0;
          Four.style.opacity = 0;
          Five.style.opacity = 0;
          Smile1.style.opacity = 0;
          Smile2.style.opacity = 0;
          HeadBlink.style.opacity = 0;
          BlinkHead2.style.opacity = 0;
          BlinkHead.style.opacity = 0;
          Head3.style.opacity = 0;
          Wrinkle.style.opacity = 0;
          WrinkleB.style.opacity = 1;
          End.style.opacity = 0;
          OneS.style.opacity = 0;
          TwoS.style.opacity = 0;
          ThreeS.style.opacity = 0;
          FourS.style.opacity = 0;
          FiveS.style.opacity = 0;
          SorryGif.style.opacity = 0;  
          NonverbalAction.push(7);
          Typing2.play();
      }
    }
  }

  function NonverbalFunctionStop() {
      clearInterval( NonVerbal);
  }
  function NonverbalFunctionStart() {
    NonVerbal = setInterval(NonverbalFunction, 5000);
  }

  // Scenes for the questions
  function Question1Function (){
    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 1;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;     
    
    console.log(One)
  }
  function Question1FunctionStop() {
    clearInterval(Q1);
  }
  function Question1FunctionStart() {
    Q1 = setInterval(Question1Function, 500);
  }
  function Question2Function (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 1;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;     
    console.log(Two)
  }
  function Question2FunctionStop() {
      clearInterval(Q2);
  }
  function Question2FunctionStart() {
    Q2 = setInterval(Question2Function, 2200);
  }
  function Question3Function (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 1;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;        
    console.log(Three)
  }
  function Question3FunctionStop() {
      clearInterval(Q3);
  }
  function Question3FunctionStart() {
    Q3 = setInterval(Question3Function, 2200);
  }
  function Question4Function (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 1;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;  
    console.log(Four);   
  }
  function Question4FunctionStop() {
      clearInterval(Q4);
  }
  function Question4FunctionStart() {
    Q4 = setInterval(Question4Function, 2200);
  }
  function Question5Function (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 1;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;     
    console.log(Five);
  }
  function Question5FunctionStop() {
      clearInterval(Q5);
  }
  function Question5FunctionStart() {
    Q5 = setInterval(Question5Function, 2200);
  }

  //Starting Scene
  function StartingFunction (){
    Before.style.opacity = 0;
    Zero.style.opacity = 1;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;   
    console.log(Zero);
  }
  function StartingFunctionStop() {
    clearInterval(VarStarting);
  }
  function StartingFunctionStart() {
    VarStarting = setInterval(StartingFunction, 900);
  }

  //Let host sign you in scnene
  function BeforeFunction (){
    Before.style.opacity = 1;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;     
    console.log(Before);
  }
  function BeforeFunctionStop() {
    clearInterval(VarBefore);
  }
  function BeforeFunctionStart() {
    VarBefore = setInterval(BeforeFunction, 700);
  }

  //Ending scene
  function EndFunction (){
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 1;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;    
    console.log(End);
  }
  function EndFunctionStop() {
    clearInterval(VarEnd);
  }
  function EndFunctionStart() {
    VarEnd = setInterval(EndFunction, 2000);
  }

  //Mistaken Scnene
  function Question1SFunction (){
    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 1;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;     
    
    console.log(OneS)
  }
  function Question1SFunctionStop() {
    clearInterval(Q1S);
  }
  function Question1SFunctionStart() {
    Q1S = setInterval(Question1SFunction, 200);
  }
  function Question2SFunction (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 1;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;     
    console.log(TwoS)
  }
  function Question2SFunctionStop() {
      clearInterval(Q2S);
  }
  function Question2SFunctionStart() {
    Q2S = setInterval(Question2SFunction, 1700);
  }
  function Question3SFunction (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 1;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;        
    console.log(ThreeS)
  }
  function Question3SFunctionStop() {
      clearInterval(Q3S);
  }
  function Question3SFunctionStart() {
    Q3S = setInterval(Question3SFunction, 1700);
  }
  function Question4SFunction (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 1;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 0;  
    console.log(FourS);   
  }
  function Question4SFunctionStop() {
      clearInterval(Q4S);
  }
  function Question4SFunctionStart() {
    Q4S = setInterval(Question4SFunction, 1700);
  }
  function Question5SFunction (){    
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 1;
    SorryGif.style.opacity = 0;     
    console.log(FiveS);
  }
  function Question5SFunctionStop() {
      clearInterval(Q5S);
  }
  function Question5SFunctionStart() {
    Q5S = setInterval(Question5SFunction, 1700);
  }

  //Starting Scene
  function SorryFunction (){
    Before.style.opacity = 0;
    Zero.style.opacity = 0;
    One.style.opacity = 0;
    Two.style.opacity = 0;
    Three.style.opacity = 0;
    Four.style.opacity = 0;
    Five.style.opacity = 0;
    Smile1.style.opacity = 0;
    Smile2.style.opacity = 0;
    HeadBlink.style.opacity = 0;
    BlinkHead.style.opacity = 0;
    BlinkHead2.style.opacity = 0;
    Head3.style.opacity = 0;
    Wrinkle.style.opacity = 0;
    WrinkleB.style.opacity = 0;
    End.style.opacity = 0;
    OneS.style.opacity = 0;
    TwoS.style.opacity = 0;
    ThreeS.style.opacity = 0;
    FourS.style.opacity = 0;
    FiveS.style.opacity = 0;
    SorryGif.style.opacity = 1;   
    console.log(Zero);
  }
  function SorryFunctionStop() {
    clearInterval(Sorry);
  }
  function SorryFunctionStart() {
    Sorry = setInterval(SorryFunction, 1500);
  }

  function download (){
    var  data = NonverbalAction
    var csv = data.map(function(d){
      return JSON.stringify(d);
    }).join('\n') 
      .replace(/(^\[)|(\]$)/mg, '');
    console.log(csv);
    var download = function(content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
  
    if (navigator.msSaveBlob) { // IE10
      navigator.msSaveBlob(new Blob([content], {
        type: mimeType
      }), fileName);
    } else if (URL && 'download' in a) { //html5 A[download]
      a.href = URL.createObjectURL(new Blob([content], {
        type: mimeType
      }));
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
    }
  
     download(csv, 'dowload.csv', 'text/csv;encoding:utf-8');

  }
  
  function downloadStart() {
    downloadVar = setInterval(download, 5000);
  }

  //assign keyboard to functions
  document.addEventListener("keypress", function(e){
    if (e.key == "Enter"){
      NonverbalAction.push(13); 
      Typing2.play();
      console.log(e.key);
      NonverbalFunctionStart();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
    } else  if (e.key == "9"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStart();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
    } else if (e.key == "1"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStart();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q1Audio.play();
    } else if (e.key == "2"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStart();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q2Audio.play();
    } else if (e.key == "3"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStart();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q3Audio.play();
    } else if (e.key == "4"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStart();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q4Audio.play();
    } else if (e.key == "5"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStart();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q5Audio.play();
    } else if (e.key == "6"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStart();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      downloadStart();
      EndAudio.play();
    }
    else if (e.key == "0"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStart();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      StartingAudio.play();
    }
    else if (e.key == "q"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStart();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q1SAudio.play();
    } else if (e.key == "w"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStart();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q2SAudio.play();
    } else if (e.key == "e"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStart();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q3SAudio.play();
    } else if (e.key == "r"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStart();
      Question5SFunctionStop();
      SorryFunctionStop();
      Q4SAudio.play();
    } else if (e.key == "t"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStart();
      SorryFunctionStop();
      Q5SAudio.play();
    } else if (e.key == "s"){
      console.log(e.key);
      NonverbalFunctionStop();
      Question1FunctionStop();
      Question2FunctionStop();
      Question3FunctionStop();
      Question4FunctionStop();
      Question5FunctionStop();
      EndFunctionStop();
      BeforeFunctionStop();
      StartingFunctionStop();
      Question1SFunctionStop();
      Question2SFunctionStop();
      Question3SFunctionStop();
      Question4SFunctionStop();
      Question5SFunctionStop();
      SorryFunctionStart();
      SorryAudio.play();
    } else if (e.key =="p"){
      //console.log(NonverbalAction);
      //console.log("os")
      //console.log( NonverbalAction.toString());
      var  data = NonverbalAction
      var csv = data.map(function(d){
        return JSON.stringify(d);
      }).join('\n') 
        .replace(/(^\[)|(\]$)/mg, '');
      console.log(csv);
      var download = function(content, fileName, mimeType) {
      var a = document.createElement('a');
      mimeType = mimeType || 'application/octet-stream';
    
      if (navigator.msSaveBlob) { // IE10
        navigator.msSaveBlob(new Blob([content], {
          type: mimeType
        }), fileName);
      } else if (URL && 'download' in a) { //html5 A[download]
        a.href = URL.createObjectURL(new Blob([content], {
          type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
      }
      }
    
       download(csv, 'dowload.csv', 'text/csv;encoding:utf-8');

    }
    
  });


})(window);