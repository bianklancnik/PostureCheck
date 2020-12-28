import 'react-native-gesture-handler';
import React, {useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import InputSpinner from "react-native-input-spinner";
import Swiper from 'react-native-swiper'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getActionFromState, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ScrollView } from 'react-native-gesture-handler';
import PushNotification from 'react-native-push-notification';
import { floor } from 'react-native-reanimated';

let timeOd;
let timeDo;
let sv = 5 * 60;

PushNotification.createChannel(
  {
    channelId: "channel-id", // (required)
    channelName: "My channel", // (required)
    channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
    playSound: true, // (optional) default: true
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
  },
  (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

PushNotification.configure({
    onRegister: function (token) {
      console.log("TOKEN:", token);
    },
    onNotification: function (notification) {
      console.log("NOTIFICATION:", notification);
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
});

function notif() {
  PushNotification.localNotificationSchedule({
    channelId: "channel-id",
    date: new Date(Number(timeOd.date) + sv * 1000), // in "spinner value" secs
    allowWhileIdle: false,
    title: 'Posture Ček',
    message: 'Popravi svojo držo! Če imaš čas naredi tudi kakšno vajo.',
  });
}

const notification = () => {
  if(Number(timeDo.date) < Number(timeOd.date)){
    alert("Ne morem opominjati tako!");
  }
  else if(Number(timeOd.date) + sv * 1000 < Date.now()){
    alert("Ne morem opominjati v preteklosti!");
  }
  else{
    PushNotification.cancelAllLocalNotifications()
    notif();
    alert("Opomnik je bil uspešno nastavljen!");
  }
};

const notificationDel = () => {
  PushNotification.cancelAllLocalNotifications()
  alert("Opomnik je bil odstranjen!");
};

function Time() {
  let t = new Date();
  t.setHours(8);
  t.setMinutes(0);
  const [date, setDate] = useState(t);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const showMode = (currentMode) => {
      setShow(true);
      setMode(currentMode);
  };
  const showDatepicker = () => {
      showMode('time');
  };

  const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || date
      setShow(Platform.OS === 'ios');
      setDate(currentDate);
  }
  return {
      date,
      showDatepicker,
      show,
      mode,
      onChange
  }
}

const formatTime = (date) => {
  var hour = date.getHours();
  var minute = date.getMinutes();
  var time=('0'  + hour).slice(-2)+':'+('0' + minute).slice(-2);
  return time;
};

function HomeScreen({ navigation }) {
  timeOd = Time()
  timeDo = Time()
  const [spinnerValue, setValue] = useState(5)
  const updateSpinnerValue = (num) => {
    sv = num * 60;
    setValue(num);
  };
  return (
    <View style={styles.position}>
      <View style={{height: "80%", width: "100%", alignItems: 'center', justifyContent: 'center', marginBottom: 80}}>
        <View style={[styles.homePage, styles.homePageTime]}>
          <Text style={styles.homeText}>Opominjaj me od:</Text>
          <Text style={styles.timeText}>{formatTime(timeOd.date)}</Text>
          <View style={{alignItems:'center'}}>
            <TouchableOpacity style={styles.buttonHome} onPress={timeOd.showDatepicker}>
              <Text style={styles.buttonHomeText}>NASTAVI ČAS</Text>
            </TouchableOpacity>
            {timeOd.show && (
            <DateTimePicker
              testID="odTimePicker"
              value={timeOd.date}
              mode={timeOd.mode}
              is24Hour={true}
              display="spinner"
              onChange={timeOd.onChange}
            />
          )}
          </View>
        </View>
        <View style={[styles.homePage, styles.homePageTime]}>
          <Text style={styles.homeText}>Opominjaj me do:</Text>
          <Text style={styles.timeText}>{formatTime(timeDo.date)}</Text>
          <View style={{alignItems:'center'}}>
            <TouchableOpacity style={styles.buttonHome} onPress={timeDo.showDatepicker}>
              <Text style={styles.buttonHomeText}>NASTAVI ČAS</Text>
            </TouchableOpacity>
            {timeDo.show && (
            <DateTimePicker
              testID="doTimePicker"
              value={timeDo.date}
              mode={timeDo.mode}
              is24Hour={true}
              display="spinner"
              onChange={timeDo.onChange}
            />
          )}
          </View>
        </View>
        <View style={[styles.homePage, styles.homePageTime]}>
          <Text style={styles.homeText}>Opomni me na vsake:</Text>
          <Text style={styles.timeText}>{spinnerValue} MIN</Text>
          <InputSpinner
            style={styles.spinner}
            max={60}
            min={5}
            step={5}
            rounded={false}
            showBorder={true}
            color={"#f4511e"}
            colorMax={"#fa2707"}
            colorMin={"#fa2707"}
            editable={false}
            onChange={(num) => {
                updateSpinnerValue(num);
            }}>
          </InputSpinner>
        </View>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={[styles.buttonHomeOpo, {marginRight: 30}]} onPress={notificationDel}>
            <Text style={styles.buttonHomeOpoText}>PONASTAVI OPOMNIK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHomeOpo} onPress={notification}>
            <Text style={styles.buttonHomeOpoText}>SHRANI OPOMNIK</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.footer, {position: 'absolute' ,bottom: 0}]}>
        <View style={styles.leftButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.navigate('Vaje')}>
            <Text style={styles.buttonFooterText} >VAJE ZA DRŽO</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.navigate('Treningi')}>
            <Text style={styles.buttonFooterText} >TRENINGI</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function TreningiScreen({ navigation }) {
  return (
    <View style={styles.position}>
      <View style={styles.vajePage}>
        <View style={styles.trening}>
          <Text style={styles.treningText}>Začetnik</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TreningZ')}>
          <Image
            style={styles.treningImg}
            source={require('./images/beginner.jpg')}
          />
          </TouchableOpacity>
        </View>
        <View style={[styles.trening, {marginTop: 30}]}>
          <Text style={styles.treningText}>Amater</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TreningZ')}>
          <Image
            style={styles.treningImg}
            source={require('./images/amater.jpg')}
          />
          </TouchableOpacity>
        </View>
        <View style={[styles.trening, {marginTop: 30}]}>
          <Text style={styles.treningText}>Profesionalec</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TreningZ')}>
          <Image
            style={styles.treningImg}
            source={require('./images/pro.jpg')}
          />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.leftButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonFooterText} >NAZAJ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonFooterText} >DOMOV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function getTime(z){
  let cas = new Date();
  cas = Number(cas) - Number(z);
  if(cas/1000 < 60)
    alert("Za trening ste porabili: " + Math.floor(cas/1000) +  " sekund");
  else
    alert("Za trening ste porabili: " + Math.floor(cas/(1000*60)) + " minut");
}

function TreningZScreen({ navigation }) {
  let zacetek = new Date();
  return (
    <View style={styles.position}>
      <Swiper style={styles.swiper} showsButtons={true}>
        <View style={styles.swiperView}>
          <Text style={styles.swiperTitle}>1. Superman</Text>
          <Image
            resizeMode='contain'
            style={styles.swiperImg}
            source={require('./images/treningi/superman.jpg')}
          />
          <Text style={styles.swiperText}>Lie on your stomach and slowly, lift both your arms and legs simultaneously, as much as possible. Hold this position for as long as you comfortably can and keep looking straight ahead.</Text>
        </View>
        <View style={styles.swiperView}>
          <Text style={styles.swiperTitle}>2. Aquaman</Text>
          <Image
            resizeMode='contain'
            style={styles.swiperImg}
            source={require('./images/treningi/aquaman.jpg')}
          />
          <Text style={styles.swiperText}>For this variation of Superman, first lift your right arm and the left leg as much as you can. And when you bring the two down, lift your left arm and your right leg. Do both these movements as fast as possible. </Text>
        </View>
        <View style={styles.swiperView}>
          <Text style={styles.swiperTitle}>3. The Cobra Pose</Text>
          <Image
            resizeMode='contain'
            style={styles.swiperImg}
            source={require('./images/treningi/cobra.jpg')}
          />
          <Text style={styles.swiperText}>Lying in the prone position, place your palms at shoulder level and tightening your stomach, lift you upper body in a stretch with your eyes facing upwards. Make sure to keep your chest lifted and avoid arching your back.</Text>
        </View>
        <View style={styles.swiperView}>
          <Text style={styles.swiperTitle}>4. Kneeling Extension</Text>
          <Image
            resizeMode='contain'
            style={styles.swiperImg}
            source={require('./images/treningi/kneeling.jpg')}
          />
          <Text style={styles.swiperText}>Get your body on all fours and left your right leg and left arm to shoulder level. Hold this position for a few seconds while looking straight ahead. Then, bring the leg and arm down and lift the left leg and right arm next.</Text>
        </View>
      </Swiper>
      <View style={styles.footer}>
        <View style={styles.leftButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonFooterText} >NAZAJ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => { getTime(zacetek); navigation.navigate('Treningi'); } }>
            <Text style={styles.buttonFooterText} >KONČAJ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function VajeScreen({ navigation }) {
  return (
    <View style={styles.position}>
      <View style={styles.vajePage}>
        <View style={styles.vaja}>
          <Text style={styles.vajeText}>Vaje za držo, ki jih lahko izvajamo sede</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VajeSede')}>
          <Image
            style={styles.vajeImg}
            source={require('./images/sitting.jpg')}
          />
          </TouchableOpacity>
        </View>
        <View style={[styles.vaja, {marginTop: 30}]}>
          <Text style={styles.vajeText}>Vaje za držo, ki jih lahko izvajamo stoje</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VajeStoje')}>
          <Image
            style={styles.vajeImg}
            source={require('./images/standing.jpg')}
          />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.leftButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonFooterText} >NAZAJ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonFooterText} >DOMOV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function VajeSedeScreen({ navigation }) {
  //const {width, height} = Dimensions.get("window")
  return (
    <View style={styles.position}>
      <ScrollView contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}} style={{marginTop: 10}}>
        <View style={styles.vajaBox}>
          <Text style={styles.boxTitle}>Kroženje z rokami | 40x v vsako smer</Text>
          <Image
            resizeMode='contain'
            style={styles.boxImage}
            source={require('./images/sitting/krozenje.jpg')}
          />
          <Text>
            1. Put your thumbs up, and fold your fingers forward so that the tips are on the top pads of your palms.{"\n\n"}
            2. Sit in a chair with your feet hip-width apart, flat on the ground, and pointed straight ahead.{"\n\n"}
            3. Extend your arms directly sideways, straight out. Point your thumbs forward, palms down, and pinch your shoulder blades back.{"\n\n"}
            4. Move your arms up and forward in a circular motion 40 times. Keep your shoulder blades pinched.{"\n\n"}
            5. Next, flip your hands palms up, thumbs pointed backward, and move your arms up and backward in circles 40 times.{"\n"}
          </Text>
        </View>
        <View style={styles.vajaBox}>
          <Text style={styles.boxTitle}>Cats and Dogs in Chair | 5x each direction</Text>
          <Image
            resizeMode='contain'
            style={styles.boxImage}
            source={require('./images/sitting/dog.jpg')}
          />
          <Text>
            1. Sit in a chair with your feet hip-width apart, flat on the ground and pointed straight ahead.{"\n\n"}
            2. Beginning the movement at the hip, roll your back slowly upward so that it finishes in a rounded position like a mad cat, your head down, chin resting on your chest. The lower half your back should be touching the chair back but your shoulders should not.{"\n\n"}
            3. Then, beginning the movement with the hip, lower your back into an inverse arch, your head and tailbone up, your shoulder blades pinching toward each other. Your low back and shoulders should be touching the chair back but your mid-back should not.{"\n\n"}
            4. Repeat 5 times each direction.{"\n"}
          </Text>
        </View>
        <View style={styles.vajaBox}>
          <Text style={styles.boxTitle}>Da Vincis in a Chair | 5x each direction</Text>
          <Image
            resizeMode='contain'
            style={styles.boxImage}
            source={require('./images/sitting/davinci.jpg')}
          />
          <Text>
            1. Sit in a chair with your feet hip-width apart, flat on the ground and pointed straight ahead.{"\n\n"}
            2. Make sure to create a small arch in your lower back, reestablishing the natural S curve.{"\n\n"}
            3. Extend your arms straight to the side, your hands palms-forward with the fingers spread wide.{"\n\n"}
            4. Keeping your hips and head stable, bend to one side using just the spine and bend back to the other side.{"\n"}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.leftButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonFooterText} >NAZAJ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonFooterText} >DOMOV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function VajeStojeScreen({ navigation }) {
  return (
    <View style={styles.position}>
      <ScrollView contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}} style={{marginTop: 10}}>
        <View style={styles.vajaBox}>
          <Text style={styles.boxTitle}>High plank</Text>
          <Image
            resizeMode='contain'
            style={styles.boxImage}
            source={require('./images/standing/posture1.jpg')}
          />
          <Text>
            1. Come onto all fours and straighten your legs, lift your heels, and raise your hips.{"\n\n"}
            2. Straighten your back and engage your abdominal, arm, and leg muscles.{"\n\n"}
            3. Lengthen the back of your neck, soften your throat, and look down at the floor.{"\n\n"}
            4. Make sure to keep your chest open and your shoulders back.{"\n\n"}
            5. Hold this position for up to 1 minute at a time.{"\n"}
          </Text>
        </View>
        <View style={styles.vajaBox}>
          <Text style={styles.boxTitle}>Side plank</Text>
          <Image
            resizeMode='contain'
            style={styles.boxImage}
            source={require('./images/standing/posture2.jpg')}
          />
          <Text>
            1. From a high plank position, bring your left hand slightly in to center.{"\n\n"}
            2. Shift your weight onto your left hand, stack your ankles, and lift your hips.{"\n\n"}
            3. Place your right hand on your hip or extend it up toward the ceiling.{"\n\n"}
            4. You can drop your left knee down to the floor for extra support.{"\n\n"}
            5. Engage your abdominals, side body, and glutes as you maintain this pose.{"\n\n"}
            6. Align your body in a straight line from the crown of your head to your heels.{"\n\n"}
            7. Look straight ahead of you or up toward your hand.{"\n\n"}
            8. Hold this pose for up to 30 seconds.{"\n\n"}
            9. Repeat on the opposite side.{"\n"}
          </Text>
        </View>
        <View style={styles.vajaBox}>
          <Text style={styles.boxTitle}>Downward-facing dog</Text>
          <Image
            resizeMode='contain'
            style={styles.boxImage}
            source={require('./images/standing/posture3.jpg')}
          />
          <Text>
            1. Lying with your stomach on the floor, press into your hands as you tuck your toes under your feet and lift your heels.{"\n\n"}
            2. Lift your knees and hips to bring your sitting bones up toward the ceiling.{"\n\n"}
            3. Bend your knees slightly and lengthen your spine.{"\n\n"}
            4. Keep your ears in line with your upper arms or tuck your chin all the way into your chest.{"\n\n"}
            5. Press firmly into your hands and keep your heels slightly lifted.{"\n\n"}
            6. Remain in this pose for up to 1 minute.{"\n"}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.leftButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonFooterText} >NAZAJ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtonFooter}>
          <TouchableOpacity style={styles.buttonFooter} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonFooterText} >DOMOV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}



const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#f4511e',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
            }}
      >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: "Posture Ček"}}
      />
      <Stack.Screen 
        name="Treningi"
        component={TreningiScreen}
        options={{title: "Posture Ček"}}
      />
      <Stack.Screen 
        name="Vaje"
        component={VajeScreen}
        options={{title: "Posture Ček"}}
      />
      <Stack.Screen 
        name="VajeSede"
        component={VajeSedeScreen}
        options={{title: "Posture Ček"}}
      />
      <Stack.Screen 
        name="VajeStoje"
        component={VajeStojeScreen}
        options={{title: "Posture Ček"}}
      />
      <Stack.Screen 
        name="TreningZ"
        component={TreningZScreen}
        options={{title: "Posture Ček"}}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//style={[styles.base, styles.background]}
const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 0,
    height: '10%',
    backgroundColor: "#f4511e"
  },
  buttonFooter: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    width: 150
  },
  leftButtonFooter: {
    marginRight: 15
  },
  rightButtonFooter: {
    marginLeft: 15
  },
  buttonFooterText: {
    color: '#f4511e',
    fontWeight: 'bold'
  },
  position: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  homePageTime: {
    borderColor: 'black',
    borderWidth: 2,
    width: '90%',
    padding: 10,
    borderRadius: 5,
  },
  homePage: {
    marginBottom: 40,
  },
  homeText: {
    textAlign: 'center',
    marginBottom: 2,
  },
  spinner: {
		width: "auto",
    minWidth: 200,
  },
  buttonHome: {
    backgroundColor: '#f4511e',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    width: 130
  },
  buttonHomeText: {
    color: 'white',
    textAlign: 'center'
  },
  buttonHomeOpo: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    width: 130
  },
  buttonHomeOpoText: {
    color: '#f4511e',
    textAlign: 'center'
  },
  timeText: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold'
  },
  vajeImg: {
    width: 400,
    height: 200,
  },
  vajeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  vajePage: {
    height:"90%", 
    alignItems:'center', 
    justifyContent: 'center'
  },
  vaja: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vajaBox: {
    width: '95%',
    borderBottomColor: 'black',
    borderBottomWidth: 2
  },
  treningImg: {
    width: 400,
    height: 150,
  },
  treningText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  trening: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxTitle: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5
  },
  boxImage: {
    width:'100%', 
    height: 210,
    marginBottom: 10
  },
  swiper: {
  },
  swiperView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swiperTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 70,
  },
  swiperText: {
    fontSize: 15,
    padding: 10
  },
  swiperImg: {
    width:'100%', 
    height: 200,
  },
});


export default App;