import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, update, push, remove, onValue} from "firebase/database";
import { Platform} from 'react-native';

const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    const locationRef = ref(db, `locations/${userId}`);

    await set(locationRef, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading,
      response: 'da',
    });

   // return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.log('Error in background location task:', error);
    return BackgroundFetch.Result.Failed;
  }
});

const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_LOCATION_TASK, {
      minimumInterval: 60, // 5 minute
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background task registered');
  } catch (err) {
    console.log('Error registering background task:', err);
  }
};

const startBackgroundLocationUpdates = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return;
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 1,
    showsBackgroundLocationIndicator: false,
    foregroundService: {
      notificationTitle: 'JoyRides este activa in fundal',
      notificationBody: 'Monitorizam locatia in timp real',
      notificationColor: '#333333',
    },
  });

 // registerBackgroundTask();
};

const stopBackgroundLocationUpdates = async () => {
  await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  await TaskManager.unregisterAllTasksAsync();
  //await BackgroundFetch.unregisterTaskAsync(BACKGROUND_LOCATION_TASK);

  // Deregistrează toate task-urile
  /*const registeredTasks = await TaskManager.getRegisteredTasksAsync();
  for (const task of registeredTasks) {
    if (task.taskName === BACKGROUND_LOCATION_TASK) {
      await TaskManager.unregisterTaskAsync(task.taskName);
    }
  }

    // Verificare dacă task-urile au fost șterse
    const remainingTasks = await TaskManager.getRegisteredTasksAsync();
    if (!remainingTasks.some(task => task.taskName === BACKGROUND_LOCATION_TASK)) {
      console.log('Toate task-urile de locație au fost deregistrate cu succes.');
    } else {
      console.log('Unele task-uri de locație nu au putut fi deregistrate.');
    }*/
  
};


export { startBackgroundLocationUpdates, stopBackgroundLocationUpdates };
